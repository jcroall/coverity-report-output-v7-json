import fs from 'fs'
import {COVERITY_PASSWORD, COVERITY_PROJECT_NAME, COVERITY_URL, COVERITY_USERNAME, DEBUG_MODE, GITHUB_TOKEN, JSON_FILE_PATH} from './inputs'
import {info, setFailed, warning} from '@actions/core'
import {
  COMMENT_PREFACE,
  coverityCreateIssueCommentMessage,
  coverityCreateNoLongerPresentMessage,
  coverityCreateReviewCommentMessage,
  coverityIsPresent,
  CoverityIssueOccurrence,
  CoverityProjectIssue,
  DiffMap,
  githubCreateIssueComment,
  githubCreateReview,
  githubGetDiffMap,
  githubGetExistingIssueComments,
  githubGetExistingReviewComments,
  githubGetPullRequestDiff,
  githubIsPullRequest,
  githubRelativizePath,
  githubUpdateExistingIssueComment,
  githubUpdateExistingReviewComment,
  logger
} from '@jcroall/synopsys-sig-node/lib'
import {coverityMapMatchingMergeKeys} from '@jcroall/synopsys-sig-node/lib/utils/coverity-issue-mapper'
import {CoverityIssuesView} from '@jcroall/synopsys-sig-node/lib/models/coverity-json-v7-schema'
import {NewReviewComment} from '@jcroall/synopsys-sig-node/lib/_namespaces/github'

async function run(): Promise<void> {
  logger.info('Starting Coverity GitHub Action')

  if (DEBUG_MODE) {
    logger.level = 'debug'
    logger.debug(`Enabled debug mode`)
  }

  if (!githubIsPullRequest()) {
    logger.info('Not a Pull Request. Nothing to do...')
    return Promise.resolve()
  }

  logger.info(`Using JSON file path: ${JSON_FILE_PATH}`)

  // TODO validate file exists and is .json?
  const jsonV7Content = fs.readFileSync(JSON_FILE_PATH)
  const coverityIssues = JSON.parse(jsonV7Content.toString()) as CoverityIssuesView

  let mergeKeyToIssue = new Map<string, CoverityProjectIssue>()

  const canCheckCoverity = COVERITY_URL && COVERITY_USERNAME && COVERITY_PASSWORD && COVERITY_PROJECT_NAME
  if (!canCheckCoverity) {
    logger.warning('Missing Coverity Connect info. Issues will not be checked against the server.')
  } else {
    const allMergeKeys = coverityIssues.issues.map(issue => issue.mergeKey)
    const allUniqueMergeKeys = new Set<string>(allMergeKeys)

    if (canCheckCoverity && coverityIssues && coverityIssues.issues.length > 0) {
      try {
        mergeKeyToIssue = await coverityMapMatchingMergeKeys(COVERITY_URL, COVERITY_USERNAME, COVERITY_PASSWORD, COVERITY_PROJECT_NAME, allUniqueMergeKeys)
      } catch (error: any) {
        setFailed(error as string | Error)
        return Promise.reject()
      }
    }
  }

  const newReviewComments = []
  const actionReviewComments = await githubGetExistingReviewComments(GITHUB_TOKEN).then(comments => comments.filter(comment => comment.body.includes(COMMENT_PREFACE)))
  const actionIssueComments = await githubGetExistingIssueComments(GITHUB_TOKEN).then(comments => comments.filter(comment => comment.body?.includes(COMMENT_PREFACE)))
  const diffMap = await githubGetPullRequestDiff(GITHUB_TOKEN).then(githubGetDiffMap)

  for (const issue of coverityIssues.issues) {
    logger.info(`Found Coverity Issue ${issue.mergeKey} at ${issue.mainEventFilePathname}:${issue.mainEventLineNumber}`)

    const projectIssue = mergeKeyToIssue.get(issue.mergeKey)
    let ignoredOnServer = false
    let newOnServer = true
    if (projectIssue) {
      ignoredOnServer = projectIssue.action == 'Ignore' || projectIssue.classification in ['False Positive', 'Intentional']
      newOnServer = projectIssue.firstSnapshotId == projectIssue.lastSnapshotId
      logger.info(`Issue state on server: ignored=${ignoredOnServer}, new=${newOnServer}`)
    }

    const reviewCommentBody = coverityCreateReviewCommentMessage(issue)
    const issueCommentBody = coverityCreateIssueCommentMessage(issue)

    const reviewCommentIndex = actionReviewComments.findIndex(comment => comment.line === issue.mainEventLineNumber && comment.body.includes(issue.mergeKey))
    let existingMatchingReviewComment = undefined
    if (reviewCommentIndex !== -1) {
      existingMatchingReviewComment = actionReviewComments.splice(reviewCommentIndex, 1)[0]
    }

    const issueCommentIndex = actionIssueComments.findIndex(comment => comment.body?.includes(issue.mergeKey))
    let existingMatchingIssueComment = undefined
    if (issueCommentIndex !== -1) {
      existingMatchingIssueComment = actionIssueComments.splice(issueCommentIndex, 1)[0]
    }

    if (existingMatchingReviewComment !== undefined) {
      logger.info(`Issue already reported in comment ${existingMatchingReviewComment.id}, updating if necessary...`)
      if (existingMatchingReviewComment.body !== reviewCommentBody) {
        githubUpdateExistingReviewComment(GITHUB_TOKEN, existingMatchingReviewComment.id, reviewCommentBody)
      }
    } else if (existingMatchingIssueComment !== undefined) {
      logger.info(`Issue already reported in comment ${existingMatchingIssueComment.id}, updating if necessary...`)
      if (existingMatchingIssueComment.body !== issueCommentBody) {
        githubUpdateExistingIssueComment(GITHUB_TOKEN, existingMatchingIssueComment.id, issueCommentBody)
      }
    } else if (ignoredOnServer) {
      logger.info('Issue ignored on server, no comment needed.')
    } else if (!newOnServer) {
      logger.info('Issue already existed on server, no comment needed.')
    } else if (isInDiff(issue, diffMap)) {
      logger.info('Issue not reported, adding a comment to the review.')
      newReviewComments.push(createReviewComment(issue, reviewCommentBody))
    } else {
      logger.info('Issue not reported, adding an issue comment.')
      githubCreateIssueComment(GITHUB_TOKEN, issueCommentBody)
    }
  }

  for (const comment of actionReviewComments) {
    if (coverityIsPresent(comment.body)) {
      info(`Comment ${comment.id} represents a Coverity issue which is no longer present, updating comment to reflect resolution.`)
      githubUpdateExistingReviewComment(GITHUB_TOKEN, comment.id, coverityCreateNoLongerPresentMessage(comment.body))
    }
  }

  for (const comment of actionIssueComments) {
    if (comment.body !== undefined && coverityIsPresent(comment.body)) {
      info(`Comment ${comment.id} represents a Coverity issue which is no longer present, updating comment to reflect resolution.`)
      githubUpdateExistingReviewComment(GITHUB_TOKEN, comment.id, coverityCreateNoLongerPresentMessage(comment.body))
    }
  }

  if (newReviewComments.length > 0) {
    info('Publishing review...')
    githubCreateReview(GITHUB_TOKEN, newReviewComments)
  }

  info(`Found ${coverityIssues.issues.length} Coverity issues.`)
}

function isInDiff(issue: CoverityIssueOccurrence, diffMap: DiffMap): boolean {
  const diffHunks = diffMap.get(issue.mainEventFilePathname)

  if (!diffHunks) {
    return false
  }

  return diffHunks.filter(hunk => hunk.firstLine <= issue.mainEventLineNumber).some(hunk => issue.mainEventLineNumber <= hunk.lastLine)
}

function createReviewComment(issue: CoverityIssueOccurrence, commentBody: string): NewReviewComment {
  return {
    path: githubRelativizePath(issue.mainEventFilePathname),
    body: commentBody,
    line: issue.mainEventLineNumber,
    side: 'RIGHT'
  }
}

run()
