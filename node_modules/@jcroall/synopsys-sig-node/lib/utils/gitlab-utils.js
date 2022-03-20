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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitlabCreateDiscussion = exports.gitlabUpdateNote = exports.gitlabGetDiffMap = exports.gitlabGetDiscussions = exports.gitlabGetProject = void 0;
var node_1 = require("@gitbeaker/node");
var SIGLogger_1 = require("./SIGLogger");
var axios_1 = __importDefault(require("axios"));
function gitlabGetProject(gitlab_url, gitlab_token, project_id) {
    return __awaiter(this, void 0, void 0, function () {
        var api, project;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new node_1.Gitlab({ token: gitlab_token });
                    SIGLogger_1.logger.debug("Getting project ".concat(project_id));
                    return [4 /*yield*/, api.Projects.show(project_id)];
                case 1:
                    project = _a.sent();
                    SIGLogger_1.logger.debug("Project name is ".concat(project.name));
                    return [2 /*return*/, project];
            }
        });
    });
}
exports.gitlabGetProject = gitlabGetProject;
function gitlabGetDiscussions(gitlab_url, gitlab_token, project_id, merge_request_iid) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function () {
        var api, merge_request, discussions, _i, discussions_1, discussion, _h, _j, note;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    api = new node_1.Gitlab({ token: gitlab_token });
                    SIGLogger_1.logger.debug("Getting merge request #".concat(merge_request_iid, " in project #").concat(project_id));
                    return [4 /*yield*/, api.MergeRequests.show(project_id, merge_request_iid)];
                case 1:
                    merge_request = _k.sent();
                    SIGLogger_1.logger.debug("Merge Request title is ".concat(merge_request.title));
                    return [4 /*yield*/, api.MergeRequestDiscussions.all(project_id, merge_request_iid)];
                case 2:
                    discussions = _k.sent();
                    for (_i = 0, discussions_1 = discussions; _i < discussions_1.length; _i++) {
                        discussion = discussions_1[_i];
                        SIGLogger_1.logger.debug("Discussion ".concat(discussion.id));
                        if (discussion.notes) {
                            for (_h = 0, _j = discussion.notes; _h < _j.length; _h++) {
                                note = _j[_h];
                                SIGLogger_1.logger.debug("  body=".concat(note.body));
                                SIGLogger_1.logger.debug("  base_sha=".concat((_a = note.position) === null || _a === void 0 ? void 0 : _a.base_sha, " head_sha=").concat((_b = note.position) === null || _b === void 0 ? void 0 : _b.head_sha, " start_sha=").concat((_c = note.position) === null || _c === void 0 ? void 0 : _c.start_sha));
                                SIGLogger_1.logger.debug("  position_type=".concat((_d = note.position) === null || _d === void 0 ? void 0 : _d.position_type, " new_path=").concat((_e = note.position) === null || _e === void 0 ? void 0 : _e.new_path, " old_path=").concat((_f = note.position) === null || _f === void 0 ? void 0 : _f.old_path));
                                SIGLogger_1.logger.debug("  new_line=".concat((_g = note.position) === null || _g === void 0 ? void 0 : _g.new_line));
                            }
                        }
                    }
                    return [2 /*return*/, discussions];
            }
        });
    });
}
exports.gitlabGetDiscussions = gitlabGetDiscussions;
function gitlabGetDiffMap(gitlab_url, gitlab_token, project_id, merge_request_iid) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var api, commits, diffMap, _i, commits_1, commit, diffs, _b, diffs_1, diff, path, diff_text, changedLines, linesAddedPosition, linesAddedString, separatorPosition, startLine, lineCount, endLine;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    api = new node_1.Gitlab({ token: gitlab_token });
                    SIGLogger_1.logger.debug("Getting commits for merge request #".concat(merge_request_iid, " in project #").concat(project_id));
                    return [4 /*yield*/, api.MergeRequests.commits(project_id, merge_request_iid)];
                case 1:
                    commits = _c.sent();
                    diffMap = new Map();
                    _i = 0, commits_1 = commits;
                    _c.label = 2;
                case 2:
                    if (!(_i < commits_1.length)) return [3 /*break*/, 5];
                    commit = commits_1[_i];
                    SIGLogger_1.logger.debug("Commit #".concat(commit.id, ": ").concat(commit.title));
                    return [4 /*yield*/, api.Commits.diff(project_id, commit.id)];
                case 3:
                    diffs = _c.sent();
                    for (_b = 0, diffs_1 = diffs; _b < diffs_1.length; _b++) {
                        diff = diffs_1[_b];
                        SIGLogger_1.logger.debug("  Diff file: ".concat(diff.new_path, " diff: ").concat(diff.diff));
                        path = diff.new_path;
                        diffMap.set(path, []);
                        diff_text = diff.diff;
                        if (diff_text.startsWith('@@')) {
                            changedLines = diff_text.substring(3);
                            changedLines = changedLines.substring(0, changedLines.indexOf(' @@'));
                            linesAddedPosition = changedLines.indexOf('+');
                            if (linesAddedPosition > -1) {
                                linesAddedString = changedLines.substring(linesAddedPosition + 1);
                                separatorPosition = linesAddedString.indexOf(',');
                                startLine = parseInt(linesAddedString.substring(0, separatorPosition));
                                lineCount = parseInt(linesAddedString.substring(separatorPosition + 1));
                                endLine = startLine + lineCount - 1;
                                if (!diffMap.has(path)) {
                                    diffMap.set(path, []);
                                }
                                SIGLogger_1.logger.debug("Added ".concat(path, ": ").concat(startLine, " to ").concat(endLine));
                                (_a = diffMap.get(path)) === null || _a === void 0 ? void 0 : _a.push({ firstLine: startLine, lastLine: endLine, sha: commit.id });
                            }
                        }
                    }
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, diffMap];
            }
        });
    });
}
exports.gitlabGetDiffMap = gitlabGetDiffMap;
function gitlabUpdateNote(gitlab_url, gitlab_token, project_id, merge_request_iid, discussion_id, note_id, body) {
    return __awaiter(this, void 0, void 0, function () {
        var api, note;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new node_1.Gitlab({ token: gitlab_token });
                    SIGLogger_1.logger.debug("Update discussion for merge request #".concat(merge_request_iid, " in project #").concat(project_id));
                    return [4 /*yield*/, api.MergeRequestDiscussions.editNote(project_id, merge_request_iid, discussion_id, note_id, { body: body })];
                case 1:
                    note = _a.sent();
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.gitlabUpdateNote = gitlabUpdateNote;
function gitlabCreateDiscussion(gitlab_url, gitlab_token, project_id, merge_request_iid, line, filename, body, base_sha) {
    return __awaiter(this, void 0, void 0, function () {
        var api, merge_request, FormData, formData, headers, url, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    api = new node_1.Gitlab({ token: gitlab_token });
                    SIGLogger_1.logger.debug("Create new discussion for merge request #".concat(merge_request_iid, " in project #").concat(project_id));
                    return [4 /*yield*/, api.MergeRequests.show(project_id, merge_request_iid)
                        // JC: GitBeaker isn't working for this case (filed https://github.com/jdalrymple/gitbeaker/issues/2396)
                        // Working around using bare REST query
                    ];
                case 1:
                    merge_request = _a.sent();
                    FormData = require('form-data');
                    formData = new FormData();
                    formData.append("body", body);
                    formData.append("position[position_type]", "text");
                    formData.append("position[base_sha]", base_sha);
                    formData.append("position[start_sha]", base_sha);
                    formData.append("position[head_sha]", merge_request.sha);
                    formData.append("position[new_path]", filename);
                    formData.append("position[old_path]", filename);
                    formData.append("position[new_line]", line.toString());
                    headers = {
                        "PRIVATE-TOKEN": gitlab_token,
                        'content-type': "multipart/form-data; boundary=".concat(formData._boundary)
                    };
                    url = "".concat(gitlab_url, "/api/v4/projects/").concat(project_id, "/merge_requests/").concat(merge_request_iid, "/discussions");
                    return [4 /*yield*/, axios_1.default.post(url, formData, {
                            headers: headers
                        })];
                case 2:
                    res = _a.sent();
                    if (res.status > 201) {
                        SIGLogger_1.logger.error("Unable to create discussion for ".concat(filename, ":").concat(line, " at ").concat(url));
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
exports.gitlabCreateDiscussion = gitlabCreateDiscussion;
