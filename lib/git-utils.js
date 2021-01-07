"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushTag = exports.push = exports.commit = exports.getCommitMessage = exports.setCommitAuthor = exports.getUserEmail = exports.getUserName = exports.setRepo = exports.copyAssets = exports.deleteExcludedAssets = exports.createBranchForce = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const glob = __importStar(require("@actions/glob"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const shelljs_1 = require("shelljs");
function createBranchForce(branch) {
    return __awaiter(this, void 0, void 0, function* () {
        yield exec.exec('git', ['init']);
        yield exec.exec('git', ['checkout', '--orphan', branch]);
        return;
    });
}
exports.createBranchForce = createBranchForce;
function deleteExcludedAssets(destDir, excludeAssets) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (excludeAssets === '')
            return;
        core.info(`[INFO] delete excluded assets`);
        const excludedAssetNames = excludeAssets.split(',');
        const excludedAssetPaths = (() => {
            const paths = [];
            for (const pattern of excludedAssetNames) {
                paths.push(path_1.default.join(destDir, pattern));
            }
            return paths;
        })();
        const globber = yield glob.create(excludedAssetPaths.join('\n'));
        const files = yield globber.glob();
        try {
            for (var _b = __asyncValues(globber.globGenerator()), _c; _c = yield _b.next(), !_c.done;) {
                const file = _c.value;
                core.info(`[INFO] delete ${file}`);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        shelljs_1.rm('-rf', files);
        return;
    });
}
exports.deleteExcludedAssets = deleteExcludedAssets;
function copyAssets(publishDir, destDir, excludeAssets) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info(`[INFO] prepare publishing assets`);
        if (!fs_1.default.existsSync(destDir)) {
            core.info(`[INFO] create ${destDir}`);
            yield utils_1.createDir(destDir);
        }
        const dotGitPath = path_1.default.join(publishDir, '.git');
        if (fs_1.default.existsSync(dotGitPath)) {
            core.info(`[INFO] delete ${dotGitPath}`);
            shelljs_1.rm('-rf', dotGitPath);
        }
        core.info(`[INFO] copy ${publishDir} to ${destDir}`);
        shelljs_1.cp('-RfL', [`${publishDir}/*`, `${publishDir}/.*`], destDir);
        yield deleteExcludedAssets(destDir, excludeAssets);
        return;
    });
}
exports.copyAssets = copyAssets;
function setRepo(inps, remoteURL, workDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const publishDir = path_1.default.isAbsolute(inps.PublishDir)
            ? inps.PublishDir
            : path_1.default.join(`${process.env.GITHUB_WORKSPACE}`, inps.PublishDir);
        if (path_1.default.isAbsolute(inps.DestinationDir)) {
            throw new Error('destination_dir should be a relative path');
        }
        const destDir = (() => {
            if (inps.DestinationDir === '') {
                return workDir;
            }
            else {
                return path_1.default.join(workDir, inps.DestinationDir);
            }
        })();
        core.info(`[INFO] ForceOrphan: ${inps.ForceOrphan}`);
        if (inps.ForceOrphan) {
            yield utils_1.createDir(destDir);
            core.info(`[INFO] chdir ${workDir}`);
            process.chdir(workDir);
            yield createBranchForce(inps.PublishBranch);
            yield copyAssets(publishDir, destDir, inps.ExcludeAssets);
            return;
        }
        const result = {
            exitcode: 0,
            output: ''
        };
        const options = {
            listeners: {
                stdout: (data) => {
                    result.output += data.toString();
                }
            }
        };
        try {
            result.exitcode = yield exec.exec('git', ['clone', '--depth=1', '--single-branch', '--branch', inps.PublishBranch, remoteURL, workDir], options);
            if (result.exitcode === 0) {
                yield utils_1.createDir(destDir);
                if (inps.KeepFiles) {
                    core.info('[INFO] Keep existing files');
                }
                else {
                    core.info(`[INFO] clean up ${destDir}`);
                    core.info(`[INFO] chdir ${destDir}`);
                    process.chdir(destDir);
                    yield exec.exec('git', ['rm', '-r', '--ignore-unmatch', '*']);
                }
                core.info(`[INFO] chdir ${workDir}`);
                process.chdir(workDir);
                yield copyAssets(publishDir, destDir, inps.ExcludeAssets);
                return;
            }
            else {
                throw new Error(`Failed to clone remote branch ${inps.PublishBranch}`);
            }
        }
        catch (e) {
            core.info(`[INFO] first deployment, create new branch ${inps.PublishBranch}`);
            core.info(`[INFO] ${e.message}`);
            yield utils_1.createDir(destDir);
            core.info(`[INFO] chdir ${workDir}`);
            process.chdir(workDir);
            yield createBranchForce(inps.PublishBranch);
            yield copyAssets(publishDir, destDir, inps.ExcludeAssets);
            return;
        }
    });
}
exports.setRepo = setRepo;
function getUserName(userName) {
    if (userName) {
        return userName;
    }
    else {
        return `${process.env.GITHUB_ACTOR}`;
    }
}
exports.getUserName = getUserName;
function getUserEmail(userEmail) {
    if (userEmail) {
        return userEmail;
    }
    else {
        return `${process.env.GITHUB_ACTOR}@users.noreply.github.com`;
    }
}
exports.getUserEmail = getUserEmail;
function setCommitAuthor(userName, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        if (userName && !userEmail) {
            throw new Error('user_email is undefined');
        }
        if (!userName && userEmail) {
            throw new Error('user_name is undefined');
        }
        yield exec.exec('git', ['config', 'user.name', getUserName(userName)]);
        yield exec.exec('git', ['config', 'user.email', getUserEmail(userEmail)]);
    });
}
exports.setCommitAuthor = setCommitAuthor;
function getCommitMessage(msg, fullMsg, extRepo, baseRepo, hash) {
    const msgHash = (() => {
        if (extRepo) {
            return `${baseRepo}@${hash}`;
        }
        else {
            return hash;
        }
    })();
    const subject = (() => {
        if (fullMsg) {
            return fullMsg;
        }
        else if (msg) {
            return `${msg} ${msgHash}`;
        }
        else {
            return `deploy: ${msgHash}`;
        }
    })();
    return subject;
}
exports.getCommitMessage = getCommitMessage;
function commit(allowEmptyCommit, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (allowEmptyCommit) {
                yield exec.exec('git', ['commit', '--allow-empty', '-m', `${msg}`]);
            }
            else {
                yield exec.exec('git', ['commit', '-m', `${msg}`]);
            }
        }
        catch (e) {
            core.info('[INFO] skip commit');
            core.debug(`[INFO] skip commit ${e.message}`);
        }
    });
}
exports.commit = commit;
function push(branch, forceOrphan) {
    return __awaiter(this, void 0, void 0, function* () {
        if (forceOrphan) {
            yield exec.exec('git', ['push', 'origin', '--force', branch]);
        }
        else {
            yield exec.exec('git', ['push', 'origin', branch]);
        }
    });
}
exports.push = push;
function pushTag(tagName, tagMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        if (tagName === '') {
            return;
        }
        let msg = '';
        if (tagMessage) {
            msg = tagMessage;
        }
        else {
            msg = `Deployment ${tagName}`;
        }
        yield exec.exec('git', ['tag', '-a', `${tagName}`, '-m', `${msg}`]);
        yield exec.exec('git', ['push', 'origin', `${tagName}`]);
    });
}
exports.pushTag = pushTag;
//# sourceMappingURL=git-utils.js.map