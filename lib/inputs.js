"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEBUG_MODE = exports.COVERITY_PASSWORD = exports.COVERITY_USERNAME = exports.COVERITY_PROJECT_NAME = exports.COVERITY_URL = exports.JSON_FILE_PATH = exports.GITHUB_TOKEN = void 0;
const core_1 = require("@actions/core");
exports.GITHUB_TOKEN = (0, core_1.getInput)('github-token');
exports.JSON_FILE_PATH = (0, core_1.getInput)('json-file-path');
exports.COVERITY_URL = (0, core_1.getInput)('coverity-url');
exports.COVERITY_PROJECT_NAME = (0, core_1.getInput)('coverity-project-name');
exports.COVERITY_USERNAME = (0, core_1.getInput)('coverity-username');
exports.COVERITY_PASSWORD = (0, core_1.getInput)('coverity-password');
exports.DEBUG_MODE = (0, core_1.getInput)('debug');
