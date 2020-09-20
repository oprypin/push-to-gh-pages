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
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const github_1 = require("@actions/github");
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const github = __importStar(require("@actions/github"));
const get_inputs_1 = require("./get-inputs");
const set_tokens_1 = require("./set-tokens");
const git_utils_1 = require("./git-utils");
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inps = get_inputs_1.getInputs();
            core.startGroup('Dump inputs');
            get_inputs_1.showInputs(inps);
            core.endGroup();
            if (core.isDebug()) {
                core.startGroup('Debug: dump context');
                console.log(github_1.context);
                core.endGroup();
            }
            const eventName = github_1.context.eventName;
            if (eventName === 'pull_request' || eventName === 'push') {
                const isForkRepository = github_1.context.payload.repository.fork;
                const isSkipOnFork = yield utils_1.skipOnFork(isForkRepository, inps.GithubToken, inps.DeployKey, inps.PersonalToken);
                if (isSkipOnFork) {
                    core.warning('This action runs on a fork and not found auth token, Skip deployment');
                    core.setOutput('skip', 'true');
                    return;
                }
            }
            core.startGroup('Setup auth token');
            const remoteURL = yield set_tokens_1.setTokens(inps);
            core.debug(`remoteURL: ${remoteURL}`);
            core.endGroup();
            core.startGroup('Prepare publishing assets');
            const date = new Date();
            const unixTime = date.getTime();
            const workDir = yield utils_1.getWorkDirName(`${unixTime}`);
            yield git_utils_1.setRepo(inps, remoteURL, workDir);
            yield utils_1.addNoJekyll(workDir, inps.DisableNoJekyll);
            yield utils_1.addCNAME(workDir, inps.CNAME);
            core.endGroup();
            core.startGroup('Setup Git config');
            try {
                yield exec.exec('git', ['remote', 'rm', 'origin']);
            }
            catch (e) {
                core.info(`[INFO] ${e.message}`);
            }
            yield exec.exec('git', ['remote', 'add', 'origin', remoteURL]);
            yield exec.exec('git', ['add', '--all']);
            yield git_utils_1.setCommitAuthor(inps.UserName, inps.UserEmail);
            core.endGroup();
            core.startGroup('Create a commit');
            const hash = `${process.env.GITHUB_SHA}`;
            const baseRepo = `${github.context.repo.owner}/${github.context.repo.repo}`;
            const commitMessage = git_utils_1.getCommitMessage(inps.CommitMessage, inps.FullCommitMessage, inps.ExternalRepository, baseRepo, hash);
            yield git_utils_1.commit(inps.AllowEmptyCommit, commitMessage);
            core.endGroup();
            core.startGroup('Push the commit or tag');
            yield git_utils_1.push(inps.PublishBranch, inps.ForceOrphan);
            yield git_utils_1.pushTag(inps.TagName, inps.TagMessage);
            core.endGroup();
            core.info('[INFO] Action successfully completed');
            return;
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
exports.run = run;
//# sourceMappingURL=main.js.map