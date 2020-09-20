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
exports.skipOnFork = exports.addCNAME = exports.addNoJekyll = exports.createDir = exports.getWorkDirName = exports.getHomeDir = void 0;
const core = __importStar(require("@actions/core"));
const io = __importStar(require("@actions/io"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getHomeDir() {
    return __awaiter(this, void 0, void 0, function* () {
        let homedir = '';
        if (process.platform === 'win32') {
            homedir = process.env['USERPROFILE'] || 'C:\\';
        }
        else {
            homedir = `${process.env.HOME}`;
        }
        core.debug(`homeDir: ${homedir}`);
        return homedir;
    });
}
exports.getHomeDir = getHomeDir;
function getWorkDirName(unixTime) {
    return __awaiter(this, void 0, void 0, function* () {
        const homeDir = yield getHomeDir();
        const workDirName = path_1.default.join(homeDir, `actions_github_pages_${unixTime}`);
        return workDirName;
    });
}
exports.getWorkDirName = getWorkDirName;
function createDir(dirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield io.mkdirP(dirPath);
        core.debug(`Created directory ${dirPath}`);
        return;
    });
}
exports.createDir = createDir;
function addNoJekyll(workDir, DisableNoJekyll) {
    return __awaiter(this, void 0, void 0, function* () {
        if (DisableNoJekyll) {
            return;
        }
        const filepath = path_1.default.join(workDir, '.nojekyll');
        if (fs_1.default.existsSync(filepath)) {
            return;
        }
        fs_1.default.closeSync(fs_1.default.openSync(filepath, 'w'));
        core.info(`[INFO] Created ${filepath}`);
    });
}
exports.addNoJekyll = addNoJekyll;
function addCNAME(workDir, content) {
    return __awaiter(this, void 0, void 0, function* () {
        if (content === '') {
            return;
        }
        const filepath = path_1.default.join(workDir, 'CNAME');
        if (fs_1.default.existsSync(filepath)) {
            core.info(`CNAME already exists, skip adding CNAME`);
            return;
        }
        fs_1.default.writeFileSync(filepath, content + '\n');
        core.info(`[INFO] Created ${filepath}`);
    });
}
exports.addCNAME = addCNAME;
function skipOnFork(isForkRepository, githubToken, deployKey, personalToken) {
    return __awaiter(this, void 0, void 0, function* () {
        if (isForkRepository) {
            if (githubToken === '' && deployKey === '' && personalToken === '') {
                return true;
            }
        }
        return false;
    });
}
exports.skipOnFork = skipOnFork;
//# sourceMappingURL=utils.js.map