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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = exports.showInputs = void 0;
const core = __importStar(require("@actions/core"));
function showInputs(inps) {
    let authMethod = '';
    if (inps.DeployKey) {
        authMethod = 'DeployKey';
    }
    else if (inps.GithubToken) {
        authMethod = 'GithubToken';
    }
    else if (inps.PersonalToken) {
        authMethod = 'PersonalToken';
    }
    core.info(`\
[INFO] ${authMethod}: true
[INFO] PublishBranch: ${inps.PublishBranch}
[INFO] PublishDir: ${inps.PublishDir}
[INFO] DestinationDir: ${inps.DestinationDir}
[INFO] ExternalRepository: ${inps.ExternalRepository}
[INFO] AllowEmptyCommit: ${inps.AllowEmptyCommit}
[INFO] KeepFiles: ${inps.KeepFiles}
[INFO] ForceOrphan: ${inps.ForceOrphan}
[INFO] UserName: ${inps.UserName}
[INFO] UserEmail: ${inps.UserEmail}
[INFO] CommitMessage: ${inps.CommitMessage}
[INFO] FullCommitMessage: ${inps.FullCommitMessage}
[INFO] TagName: ${inps.TagName}
[INFO] TagMessage: ${inps.TagMessage}
[INFO] EnableJekyll (DisableNoJekyll): ${inps.DisableNoJekyll}
[INFO] CNAME: ${inps.CNAME}
[INFO] ExcludeAssets ${inps.ExcludeAssets}
`);
}
exports.showInputs = showInputs;
function getInputs() {
    let useBuiltinJekyll = false;
    const enableJekyll = (core.getInput('enable_jekyll') || 'false').toUpperCase() === 'TRUE';
    const disableNoJekyll = (core.getInput('disable_nojekyll') || 'false').toUpperCase() === 'TRUE';
    if (enableJekyll && disableNoJekyll) {
        throw new Error(`Use either of enable_jekyll or disable_nojekyll`);
    }
    else if (enableJekyll) {
        useBuiltinJekyll = true;
    }
    else if (disableNoJekyll) {
        useBuiltinJekyll = true;
    }
    const inps = {
        DeployKey: core.getInput('deploy_key'),
        GithubToken: core.getInput('github_token'),
        PersonalToken: core.getInput('personal_token'),
        PublishBranch: core.getInput('publish_branch'),
        PublishDir: core.getInput('publish_dir'),
        DestinationDir: core.getInput('destination_dir'),
        ExternalRepository: core.getInput('external_repository'),
        AllowEmptyCommit: (core.getInput('allow_empty_commit') || 'false').toUpperCase() === 'TRUE',
        KeepFiles: (core.getInput('keep_files') || 'false').toUpperCase() === 'TRUE',
        ForceOrphan: (core.getInput('force_orphan') || 'false').toUpperCase() === 'TRUE',
        UserName: core.getInput('user_name'),
        UserEmail: core.getInput('user_email'),
        CommitMessage: core.getInput('commit_message'),
        FullCommitMessage: core.getInput('full_commit_message'),
        TagName: core.getInput('tag_name'),
        TagMessage: core.getInput('tag_message'),
        DisableNoJekyll: useBuiltinJekyll,
        CNAME: core.getInput('cname'),
        ExcludeAssets: core.getInput('exclude_assets')
    };
    return inps;
}
exports.getInputs = getInputs;
//# sourceMappingURL=get-inputs.js.map