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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTokens = exports.getPublishRepo = exports.setPersonalToken = exports.setGithubToken = exports.setSSHKey = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const github = __importStar(require("@actions/github"));
const io = __importStar(require("@actions/io"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const cpSpawnSync = require('child_process').spawnSync;
const cpexec = require('child_process').execFileSync;
const utils_1 = require("./utils");
function setSSHKey(inps, publishRepo) {
    return __awaiter(this, void 0, void 0, function* () {
        core.info('[INFO] setup SSH deploy key');
        const homeDir = yield utils_1.getHomeDir();
        const sshDir = path_1.default.join(homeDir, '.ssh');
        yield io.mkdirP(sshDir);
        yield exec.exec('chmod', ['700', sshDir]);
        const knownHosts = path_1.default.join(sshDir, 'known_hosts');
        const cmdSSHkeyscanOutput = `\
# github.com:22 SSH-2.0-babeld-1f0633a6
github.com ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEAq2A7hRGmdnm9tUDbO9IDSwBK6TbQa+PXYPCPy6rbTrTtw7PHkccKrpp0yVhp5HdEIcKr6pLlVDBfOLX9QUsyCOV0wzfjIJNlGEYsdlLJizHhbn2mUjvSAHQqZETYP81eFzLQNnPHt4EVVUh7VfDESU84KezmD5QlWpXLmvU31/yMf+Se8xhHTvKSCZIFImWwoG6mbUoWf9nzpIoaSjB+weqqUUmpaaasXVal72J+UX2B+2RPW3RcT0eOzQgqlJL3RKrTJvdsjE3JEAvGq3lGHSZXy28G3skua2SmVi/w4yCE6gbODqnTWlg7+wC604ydGXA8VJiS5ap43JXiUFFAaQ==
`;
        fs_1.default.writeFileSync(knownHosts, cmdSSHkeyscanOutput + '\n');
        core.info(`[INFO] wrote ${knownHosts}`);
        yield exec.exec('chmod', ['600', knownHosts]);
        const idRSA = path_1.default.join(sshDir, 'github');
        fs_1.default.writeFileSync(idRSA, inps.DeployKey + '\n');
        core.info(`[INFO] wrote ${idRSA}`);
        yield exec.exec('chmod', ['600', idRSA]);
        const sshConfigPath = path_1.default.join(sshDir, 'config');
        const sshConfigContent = `\
Host github
    HostName github.com
    IdentityFile ~/.ssh/github
    User git
`;
        fs_1.default.writeFileSync(sshConfigPath, sshConfigContent + '\n');
        core.info(`[INFO] wrote ${sshConfigPath}`);
        yield exec.exec('chmod', ['600', sshConfigPath]);
        if (process.platform === 'win32') {
            core.warning(`\
Currently, the deploy_key option is not supported on the windows-latest.
Watch https://github.com/peaceiris/actions-gh-pages/issues/87
`);
            yield cpSpawnSync('Start-Process', ['powershell.exe', '-Verb', 'runas']);
            yield cpSpawnSync('sh', ['-c', '\'eval "$(ssh-agent)"\''], { shell: true });
            yield exec.exec('sc', ['config', 'ssh-agent', 'start=auto']);
            yield exec.exec('sc', ['start', 'ssh-agent']);
        }
        yield cpexec('ssh-agent', ['-a', '/tmp/ssh-auth.sock']);
        core.exportVariable('SSH_AUTH_SOCK', '/tmp/ssh-auth.sock');
        yield exec.exec('ssh-add', [idRSA]);
        return `git@github.com:${publishRepo}.git`;
    });
}
exports.setSSHKey = setSSHKey;
function setGithubToken(githubToken, publishRepo, publishBranch, externalRepository, ref, eventName) {
    core.info('[INFO] setup GITHUB_TOKEN');
    core.debug(`ref: ${ref}`);
    core.debug(`eventName: ${eventName}`);
    let isProhibitedBranch = false;
    if (externalRepository) {
        throw new Error(`\
The generated GITHUB_TOKEN (github_token) does not support to push to an external repository.
Use deploy_key or personal_token.
`);
    }
    if (eventName === 'push') {
        isProhibitedBranch = ref.match(new RegExp(`^refs/heads/${publishBranch}$`)) !== null;
        if (isProhibitedBranch) {
            throw new Error(`\
You deploy from ${publishBranch} to ${publishBranch}
This operation is prohibited to protect your contents
`);
        }
    }
    return `https://x-access-token:${githubToken}@github.com/${publishRepo}.git`;
}
exports.setGithubToken = setGithubToken;
function setPersonalToken(personalToken, publishRepo) {
    core.info('[INFO] setup personal access token');
    return `https://x-access-token:${personalToken}@github.com/${publishRepo}.git`;
}
exports.setPersonalToken = setPersonalToken;
function getPublishRepo(externalRepository, owner, repo) {
    if (externalRepository) {
        return externalRepository;
    }
    return `${owner}/${repo}`;
}
exports.getPublishRepo = getPublishRepo;
function setTokens(inps) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const publishRepo = getPublishRepo(inps.ExternalRepository, github.context.repo.owner, github.context.repo.repo);
            if (inps.DeployKey) {
                return setSSHKey(inps, publishRepo);
            }
            else if (inps.GithubToken) {
                const context = github.context;
                const ref = context.ref;
                const eventName = context.eventName;
                return setGithubToken(inps.GithubToken, publishRepo, inps.PublishBranch, inps.ExternalRepository, ref, eventName);
            }
            else if (inps.PersonalToken) {
                return setPersonalToken(inps.PersonalToken, publishRepo);
            }
            else {
                throw new Error('not found deploy key or tokens');
            }
        }
        catch (e) {
            throw new Error(e.message);
        }
    });
}
exports.setTokens = setTokens;
//# sourceMappingURL=set-tokens.js.map