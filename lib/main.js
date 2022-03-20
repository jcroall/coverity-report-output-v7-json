"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const inputs_1 = require("./inputs");
const core_1 = require("@actions/core");
const lib_1 = require("@jcroall/synopsys-sig-node/lib");
const coverity_issue_mapper_1 = require("@jcroall/synopsys-sig-node/lib/utils/coverity-issue-mapper");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        lib_1.logger.info('Starting Coverity GitHub Action');
        if (inputs_1.DEBUG_MODE) {
            lib_1.logger.level = 'debug';
            lib_1.logger.debug(`Enabled debug mode`);
        }
        if (!(0, lib_1.githubIsPullRequest)()) {
            lib_1.logger.info('Not a Pull Request. Nothing to do...');
            return Promise.resolve();
        }
        lib_1.logger.info(`Using JSON file path: ${inputs_1.JSON_FILE_PATH}`);
        // TODO validate file exists and is .json?
        const jsonV7Content = fs_1.default.readFileSync(inputs_1.JSON_FILE_PATH);
        const coverityIssues = JSON.parse(jsonV7Content.toString());
        let mergeKeyToIssue = new Map();
        const canCheckCoverity = inputs_1.COVERITY_URL && inputs_1.COVERITY_USERNAME && inputs_1.COVERITY_PASSWORD && inputs_1.COVERITY_PROJECT_NAME;
        if (!canCheckCoverity) {
            lib_1.logger.warning('Missing Coverity Connect info. Issues will not be checked against the server.');
        }
        else {
            const allMergeKeys = coverityIssues.issues.map(issue => issue.mergeKey);
            const allUniqueMergeKeys = new Set(allMergeKeys);
            if (canCheckCoverity && coverityIssues && coverityIssues.issues.length > 0) {
                try {
                    mergeKeyToIssue = yield (0, coverity_issue_mapper_1.coverityMapMatchingMergeKeys)(inputs_1.COVERITY_URL, inputs_1.COVERITY_USERNAME, inputs_1.COVERITY_PASSWORD, inputs_1.COVERITY_PROJECT_NAME, allUniqueMergeKeys);
                }
                catch (error) {
                    (0, core_1.setFailed)(error);
                    return Promise.reject();
                }
            }
        }
        const newReviewComments = [];
        const actionReviewComments = yield (0, lib_1.githubGetExistingReviewComments)(inputs_1.GITHUB_TOKEN).then(comments => comments.filter(comment => comment.body.includes(lib_1.COMMENT_PREFACE)));
        const actionIssueComments = yield (0, lib_1.githubGetExistingIssueComments)(inputs_1.GITHUB_TOKEN).then(comments => comments.filter(comment => { var _a; return (_a = comment.body) === null || _a === void 0 ? void 0 : _a.includes(lib_1.COMMENT_PREFACE); }));
        const diffMap = yield (0, lib_1.githubGetPullRequestDiff)(inputs_1.GITHUB_TOKEN).then(lib_1.githubGetDiffMap);
        for (const issue of coverityIssues.issues) {
            lib_1.logger.info(`Found Coverity Issue ${issue.mergeKey} at ${issue.mainEventFilePathname}:${issue.mainEventLineNumber}`);
            const projectIssue = mergeKeyToIssue.get(issue.mergeKey);
            let ignoredOnServer = false;
            let newOnServer = true;
            if (projectIssue) {
                ignoredOnServer = projectIssue.action == 'Ignore' || projectIssue.classification in ['False Positive', 'Intentional'];
                newOnServer = projectIssue.firstSnapshotId == projectIssue.lastSnapshotId;
                lib_1.logger.info(`Issue state on server: ignored=${ignoredOnServer}, new=${newOnServer}`);
            }
            const reviewCommentBody = (0, lib_1.coverityCreateReviewCommentMessage)(issue);
            const issueCommentBody = (0, lib_1.coverityCreateIssueCommentMessage)(issue);
            const reviewCommentIndex = actionReviewComments.findIndex(comment => comment.line === issue.mainEventLineNumber && comment.body.includes(issue.mergeKey));
            let existingMatchingReviewComment = undefined;
            if (reviewCommentIndex !== -1) {
                existingMatchingReviewComment = actionReviewComments.splice(reviewCommentIndex, 1)[0];
            }
            const issueCommentIndex = actionIssueComments.findIndex(comment => { var _a; return (_a = comment.body) === null || _a === void 0 ? void 0 : _a.includes(issue.mergeKey); });
            let existingMatchingIssueComment = undefined;
            if (issueCommentIndex !== -1) {
                existingMatchingIssueComment = actionIssueComments.splice(issueCommentIndex, 1)[0];
            }
            if (existingMatchingReviewComment !== undefined) {
                lib_1.logger.info(`Issue already reported in comment ${existingMatchingReviewComment.id}, updating if necessary...`);
                if (existingMatchingReviewComment.body !== reviewCommentBody) {
                    (0, lib_1.githubUpdateExistingReviewComment)(inputs_1.GITHUB_TOKEN, existingMatchingReviewComment.id, reviewCommentBody);
                }
            }
            else if (existingMatchingIssueComment !== undefined) {
                lib_1.logger.info(`Issue already reported in comment ${existingMatchingIssueComment.id}, updating if necessary...`);
                if (existingMatchingIssueComment.body !== issueCommentBody) {
                    (0, lib_1.githubUpdateExistingIssueComment)(inputs_1.GITHUB_TOKEN, existingMatchingIssueComment.id, issueCommentBody);
                }
            }
            else if (ignoredOnServer) {
                lib_1.logger.info('Issue ignored on server, no comment needed.');
            }
            else if (!newOnServer) {
                lib_1.logger.info('Issue already existed on server, no comment needed.');
            }
            else if (isInDiff(issue, diffMap)) {
                lib_1.logger.info('Issue not reported, adding a comment to the review.');
                newReviewComments.push(createReviewComment(issue, reviewCommentBody));
            }
            else {
                lib_1.logger.info('Issue not reported, adding an issue comment.');
                (0, lib_1.githubCreateIssueComment)(inputs_1.GITHUB_TOKEN, issueCommentBody);
            }
        }
        for (const comment of actionReviewComments) {
            if ((0, lib_1.coverityIsPresent)(comment.body)) {
                (0, core_1.info)(`Comment ${comment.id} represents a Coverity issue which is no longer present, updating comment to reflect resolution.`);
                (0, lib_1.githubUpdateExistingReviewComment)(inputs_1.GITHUB_TOKEN, comment.id, (0, lib_1.coverityCreateNoLongerPresentMessage)(comment.body));
            }
        }
        for (const comment of actionIssueComments) {
            if (comment.body !== undefined && (0, lib_1.coverityIsPresent)(comment.body)) {
                (0, core_1.info)(`Comment ${comment.id} represents a Coverity issue which is no longer present, updating comment to reflect resolution.`);
                (0, lib_1.githubUpdateExistingReviewComment)(inputs_1.GITHUB_TOKEN, comment.id, (0, lib_1.coverityCreateNoLongerPresentMessage)(comment.body));
            }
        }
        if (newReviewComments.length > 0) {
            (0, core_1.info)('Publishing review...');
            (0, lib_1.githubCreateReview)(inputs_1.GITHUB_TOKEN, newReviewComments);
        }
        (0, core_1.info)(`Found ${coverityIssues.issues.length} Coverity issues.`);
    });
}
function isInDiff(issue, diffMap) {
    const diffHunks = diffMap.get(issue.mainEventFilePathname);
    if (!diffHunks) {
        return false;
    }
    return diffHunks.filter(hunk => hunk.firstLine <= issue.mainEventLineNumber).some(hunk => issue.mainEventLineNumber <= hunk.lastLine);
}
function createReviewComment(issue, commentBody) {
    return {
        path: (0, lib_1.githubRelativizePath)(issue.mainEventFilePathname),
        body: commentBody,
        line: issue.mainEventLineNumber,
        side: 'RIGHT'
    };
}
run();
