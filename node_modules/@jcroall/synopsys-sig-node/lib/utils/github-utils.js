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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubGetDiffMap = exports.githubCreateIssueComment = exports.githubUpdateExistingIssueComment = exports.githubGetExistingIssueComments = exports.githubCreateReview = exports.githubUpdateExistingReviewComment = exports.githubGetExistingReviewComments = exports.githubGetPullRequestDiff = exports.githubRelativizePath = exports.githubGetPullRequestNumber = exports.githubGetSha = exports.githubIsPullRequest = void 0;
var github_1 = require("@actions/github");
var coverity_utils_1 = require("./coverity-utils");
var prEvents = ['pull_request', 'pull_request_review', 'pull_request_review_comment'];
function githubIsPullRequest() {
    return prEvents.includes(github_1.context.eventName);
}
exports.githubIsPullRequest = githubIsPullRequest;
function githubGetSha() {
    var sha = github_1.context.sha;
    if (githubIsPullRequest()) {
        var pull = github_1.context.payload.pull_request;
        if (pull === null || pull === void 0 ? void 0 : pull.head.sha) {
            sha = pull === null || pull === void 0 ? void 0 : pull.head.sha;
        }
    }
    return sha;
}
exports.githubGetSha = githubGetSha;
function githubGetPullRequestNumber() {
    var pr_number = undefined;
    if (githubIsPullRequest()) {
        var pull = github_1.context.payload.pull_request;
        if (pull === null || pull === void 0 ? void 0 : pull.number) {
            pr_number = pull.number;
        }
    }
    return pr_number;
}
exports.githubGetPullRequestNumber = githubGetPullRequestNumber;
function githubRelativizePath(path) {
    var _a;
    var length = (_a = process.env.GITHUB_WORKSPACE) === null || _a === void 0 ? void 0 : _a.length;
    if (!length) {
        length = 'undefined'.length;
    }
    return path.substring(length + 1);
}
exports.githubRelativizePath = githubRelativizePath;
function githubGetPullRequestDiff(github_token) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, pullRequestNumber, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = (0, github_1.getOctokit)(github_token);
                    pullRequestNumber = githubGetPullRequestNumber();
                    if (!pullRequestNumber) {
                        return [2 /*return*/, Promise.reject(Error('Could not get Pull Request Diff: Action was not running on a Pull Request'))];
                    }
                    return [4 /*yield*/, octokit.rest.pulls.get({
                            owner: github_1.context.repo.owner,
                            repo: github_1.context.repo.repo,
                            pull_number: pullRequestNumber,
                            mediaType: {
                                format: 'diff'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
exports.githubGetPullRequestDiff = githubGetPullRequestDiff;
function githubGetExistingReviewComments(github_token) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, pullRequestNumber, reviewCommentsResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = (0, github_1.getOctokit)(github_token);
                    pullRequestNumber = githubGetPullRequestNumber();
                    if (!pullRequestNumber) {
                        return [2 /*return*/, Promise.reject(Error('Could not create Pull Request Review Comment: Action was not running on a Pull Request'))];
                    }
                    return [4 /*yield*/, octokit.rest.pulls.listReviewComments({
                            owner: github_1.context.repo.owner,
                            repo: github_1.context.repo.repo,
                            pull_number: pullRequestNumber
                        })];
                case 1:
                    reviewCommentsResponse = _a.sent();
                    return [2 /*return*/, reviewCommentsResponse.data];
            }
        });
    });
}
exports.githubGetExistingReviewComments = githubGetExistingReviewComments;
function githubUpdateExistingReviewComment(github_token, commentId, body) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit;
        return __generator(this, function (_a) {
            octokit = (0, github_1.getOctokit)(github_token);
            octokit.rest.pulls.updateReviewComment({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                comment_id: commentId,
                body: body
            });
            return [2 /*return*/];
        });
    });
}
exports.githubUpdateExistingReviewComment = githubUpdateExistingReviewComment;
function githubCreateReview(github_token, comments, event) {
    if (event === void 0) { event = 'COMMENT'; }
    return __awaiter(this, void 0, void 0, function () {
        var octokit, pullRequestNumber;
        return __generator(this, function (_a) {
            octokit = (0, github_1.getOctokit)(github_token);
            pullRequestNumber = githubGetPullRequestNumber();
            if (!pullRequestNumber) {
                return [2 /*return*/, Promise.reject(Error('Could not create Pull Request Review Comment: Action was not running on a Pull Request'))];
            }
            octokit.rest.pulls.createReview({
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                pull_number: pullRequestNumber,
                event: event,
                comments: comments
            });
            return [2 /*return*/];
        });
    });
}
exports.githubCreateReview = githubCreateReview;
function githubGetExistingIssueComments(github_token) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit, existingComments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    octokit = (0, github_1.getOctokit)(github_token);
                    return [4 /*yield*/, octokit.rest.issues.listComments({
                            issue_number: github_1.context.issue.number,
                            owner: github_1.context.repo.owner,
                            repo: github_1.context.repo.repo
                        })];
                case 1:
                    existingComments = (_a.sent()).data;
                    return [2 /*return*/, existingComments];
            }
        });
    });
}
exports.githubGetExistingIssueComments = githubGetExistingIssueComments;
function githubUpdateExistingIssueComment(github_token, commentId, body) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit;
        return __generator(this, function (_a) {
            octokit = (0, github_1.getOctokit)(github_token);
            octokit.rest.issues.updateComment({
                issue_number: github_1.context.issue.number,
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                comment_id: commentId,
                body: body
            });
            return [2 /*return*/];
        });
    });
}
exports.githubUpdateExistingIssueComment = githubUpdateExistingIssueComment;
function githubCreateIssueComment(github_token, body) {
    return __awaiter(this, void 0, void 0, function () {
        var octokit;
        return __generator(this, function (_a) {
            octokit = (0, github_1.getOctokit)(github_token);
            octokit.rest.issues.createComment({
                issue_number: github_1.context.issue.number,
                owner: github_1.context.repo.owner,
                repo: github_1.context.repo.repo,
                body: body
            });
            return [2 /*return*/];
        });
    });
}
exports.githubCreateIssueComment = githubCreateIssueComment;
function githubGetDiffMap(rawDiff) {
    var _a;
    console.info('Gathering diffs...');
    var diffMap = new Map();
    var path = coverity_utils_1.UNKNOWN_FILE;
    for (var _i = 0, _b = rawDiff.split('\n'); _i < _b.length; _i++) {
        var line = _b[_i];
        if (line.startsWith('diff --git')) {
            // TODO: Handle spaces in path
            path = "".concat(process.env.GITHUB_WORKSPACE, "/").concat(line.split(' ')[2].substring(2));
            if (path === undefined) {
                path = coverity_utils_1.UNKNOWN_FILE;
            }
            diffMap.set(path, []);
        }
        if (line.startsWith('@@')) {
            var changedLines = line.substring(3);
            changedLines = changedLines.substring(0, changedLines.indexOf(' @@'));
            var linesAddedPosition = changedLines.indexOf('+');
            if (linesAddedPosition > -1) {
                // We only care about the right side because Coverity can only analyze what's there, not what used to be --rotte FEB 2022
                var linesAddedString = changedLines.substring(linesAddedPosition + 1);
                var separatorPosition = linesAddedString.indexOf(',');
                var startLine = parseInt(linesAddedString.substring(0, separatorPosition));
                var lineCount = parseInt(linesAddedString.substring(separatorPosition + 1));
                var endLine = startLine + lineCount - 1;
                if (!diffMap.has(path)) {
                    diffMap.set(path, []);
                }
                console.info("Added ".concat(path, ": ").concat(startLine, " to ").concat(endLine));
                (_a = diffMap.get(path)) === null || _a === void 0 ? void 0 : _a.push({ firstLine: startLine, lastLine: endLine });
            }
        }
    }
    return diffMap;
}
exports.githubGetDiffMap = githubGetDiffMap;
