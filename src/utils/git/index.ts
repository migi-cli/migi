import { SimpleGit, simpleGit } from "simple-git";
import path from "path";
import fse from "fs-extra";
import inquirer from "inquirer";
import colors from "colors";
import ora from "ora";
import semver, { ReleaseType } from "semver";
import { execSync } from "child_process";
import { PublishOptions, PublishPrepareInfo } from "../../types";
import { ensureCliHome, log } from "../../utils";
import { readFile, writeFile } from "../file";
import GitServer from "./GitServer";
import Github from "./Github";
import Gitee from "./Gitee";
import Gitlab from "./Gitlab";
import { ApiResult } from "./request";

const GIT_ROOT_DIR = ".git";
const GIT_SERVER_FILE = ".gitserver";
const GIT_TOKEN_FILE = ".gittoken";
const GIT_LOGIN_FILE = ".gitlogin";
const GIT_OWN_FILE = ".gitown";
const GIT_IGNORE_FILE = ".gitignore";
const VERSION_RELEASE = "release"; // release分支名
const VERSION_DEVELOP = "dev"; // dev分支名
type Version = typeof VERSION_RELEASE | typeof VERSION_DEVELOP;
const GIT_SERVER_LIST = [
  {
    name: "Github",
    value: "github",
  },
  {
    name: "Gitee",
    value: "gitee",
  },
  {
    name: "Gitlab",
    value: "gitlab",
  },
];

const GIT_OWNER_TYPE = [
  {
    name: "User",
    value: "user",
  },
  {
    name: "Org",
    value: "org",
  },
];

const GIT_OWNER_TYPE_ONLY = [
  {
    name: "User",
    value: "user",
  },
];
export class Git {
  private git: SimpleGit; // git实例，用于git操作
  private name: string; // 待发布项目名称
  private version: string; // 待发布项目版本
  private dir: string; // 待发布项目当前路径
  private cliHome: string = ""; // 本地缓存目录~/.migi
  private refreshGitServer: boolean; // 是否刷新本地gitServer缓存
  private refreshGitToken: boolean; // 是否刷新本地gitToken缓存
  private refreshGitOwner: boolean; // 是否刷新本地gitOwner缓存
  private gitServer!: GitServer;
  private user!: ApiResult;
  private orgs!: ApiResult[];
  private owner: string = "user"; // 个人或组织
  private login: string = ""; // 账户名或组织名
  private repo: any; // api调用远程仓库拿到的结果
  private remote: string = ""; // 远程仓库的git地址
  private branch: string = ""; // 分支名
  constructor({
    name,
    version,
    dir,
    refreshGitServer,
    refreshGitToken,
    refreshGitOwner,
  }: PublishPrepareInfo & PublishOptions) {
    this.git = simpleGit(dir);
    this.name = name;
    this.version = version;
    this.dir = dir;
    this.refreshGitServer = !!refreshGitServer;
    this.refreshGitToken = !!refreshGitToken;
    this.refreshGitOwner = !!refreshGitOwner;
  }

  async precommit() {
    this.cliHome = ensureCliHome();
    await this.checkGitServer();
    await this.checkGitToken();
    await this.checkUserAndOrgs();
    await this.checkGitOwner();
    await this.checkRepo();
    await this.checkGitIgnore();
    await this.initGit();
  }
  async commit() {
    await this.checkVersion();
    await this.checkStash();
    await this.checkConflict();
    await this.checkCommit();
    await this.checkoutBranch(this.branch);
    await this.pullOriginMatserAndThisBranch();
    await this.pushOrigin(this.branch);
  }
  async build() {
    await this.checkBuildDist();
  }
  async publish() {}

  async checkGitServer() {
    // 检测使用哪个git平台（默认为github）
    const gitServerPath = this.createCachePath(GIT_SERVER_FILE);
    let gitServer = readFile(gitServerPath);

    if (!gitServer || this.refreshGitServer) {
      const res = await inquirer.prompt<{ gitServer: string }>({
        name: "gitServer",
        type: "list",
        choices: GIT_SERVER_LIST,
        message: "Please select a git server",
        default: "github",
      });
      gitServer = res.gitServer;

      writeFile(gitServerPath, gitServer);
      log.success(
        "CheckGitServer",
        `Write ${colors.green(gitServer)} to ${gitServerPath} successful`
      );
    } else {
      log.success("CheckGitServer", `Using ${colors.green(gitServer)}`);
    }
    this.gitServer = createGitServer(gitServer);
  }

  async checkGitToken() {
    // 检测 Git Token, 后续利用该 token 进行操作
    const gitTokenPath = this.createCachePath(GIT_TOKEN_FILE);
    let token = readFile(gitTokenPath);
    if (!token || this.refreshGitToken) {
      log.notice(
        "CheckGitToken",
        `${this.gitServer.type} token was not found, please generate token first.(${this.gitServer.tokenHelpUrl})`
      );
      const res = await inquirer.prompt<{ token: string }>({
        name: "token",
        type: "input",
        message: "Your token",
      });
      token = res.token;
      writeFile(gitTokenPath, token);
      log.success(
        "CheckGitToken",
        `Write ${colors.green(token)} to ${gitTokenPath} successful`
      );
    } else {
      log.success("CheckGitToken", `Using ${colors.green(token)}`);
    }
    this.gitServer.setToken(token);
  }

  async checkUserAndOrgs() {
    // 检测用户/组织是否存在
    this.user = await this.gitServer.getUser();
    this.orgs = await this.gitServer.getOrgs();
    if (!this.user || !this.orgs) {
      throw new Error("Cannot access to user or orgs");
    }
    log.success("CheckUserAndOrgs", "Access to user and orgs successful");
  }

  async checkGitOwner() {
    // 检查是个人(user)或组织(org)
    // 个人：login即为账户名（eg: tian0o0）
    // 组织：需要选择具体组织，login为所选组织名（eg: migi-cli）
    const ownerPath = this.createCachePath(GIT_OWN_FILE);
    const loginPath = this.createCachePath(GIT_LOGIN_FILE);
    let owner = readFile(ownerPath);
    let login = readFile(loginPath);
    if (!owner || !login || this.refreshGitOwner) {
      const res = await inquirer.prompt<{ owner: string }>({
        name: "owner",
        type: "list",
        choices: this.orgs.length > 0 ? GIT_OWNER_TYPE : GIT_OWNER_TYPE_ONLY,
        message: "Please select owner type",
      });
      owner = res.owner;
      if (owner === "user") {
        login = this.user.login;
      } else {
        const res2 = await inquirer.prompt<{ login: string }>({
          name: "login",
          type: "list",
          choices: this.orgs.map((item) => ({
            name: item.login,
            value: item.login,
          })),
          message: "Please Select org",
        });
        login = res2.login;
      }
      writeFile(ownerPath, owner);
      writeFile(loginPath, login);
      log.success(
        "CheckGitOwner",
        `Write ${colors.green(owner)} to ${ownerPath} successful`
      );
      log.success(
        "CheckGitOwner",
        `Write ${colors.green(login)} to ${loginPath} successful`
      );
    } else {
      log.success("CheckGitOwner", `Using ${colors.green(owner)}`);
      log.success("CheckGitOwner", `Using ${colors.green(login)}`);
    }
    this.owner = owner;
    this.login = login;
  }

  async checkRepo() {
    // 根据用户输入获取当前项目的仓库信息，如果没有则自动创建
    let repo = await this.gitServer.getRepo(this.login, this.name);
    if (!repo) {
      const loading = ora(`Creating Remote repo: ${colors.green(this.name)}`);
      loading.start();
      try {
        if (this.owner === "user") {
          repo = await this.gitServer.createRepo(this.name);
        } else {
          repo = await this.gitServer.createOrgRepo(this.login, this.name);
        }
      } catch (e) {
        loading.fail("Remote repo created fail");
        throw new Error("Remote repo created fail");
      }
      if (repo) {
        loading.succeed();
      }
    }
    log.success(
      "CheckRepo",
      `Access to remote repo ${colors.green(this.name)} successful`
    );
    this.repo = repo;
  }

  async checkGitIgnore() {
    const gitIgnore = path.resolve(this.dir, GIT_IGNORE_FILE);
    if (!fse.existsSync(gitIgnore)) {
      writeFile(
        gitIgnore,
        `.DS_Store
node_modules
/dist


# local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
      );
      log.success("CheckGitIgnore", ".gitignore file generated successful");
    }
  }

  async initGit() {
    const yes = this.hasInit();
    if (!yes) {
      await this.initAndAddRemote();
    }
    await this.initCommit();
  }

  hasInit(): boolean | undefined {
    // 检测带发布项目目录是否存在.git文件夹
    this.remote = this.gitServer.getRemote(this.login, this.name);
    const gitPath = path.resolve(this.dir, GIT_ROOT_DIR);
    if (fse.existsSync(gitPath)) {
      log.success("GitInit", "Found `.git` fold, skip git init.");
      return true;
    }
  }

  async initAndAddRemote() {
    await this.git.init();
    log.success("GitInit", "Exec 'git init'");
    const remotes = await this.git.getRemotes();
    if (!remotes.find((item) => item.name === "origin")) {
      await this.git.addRemote("origin", this.remote);
      log.success("GitInit", "Exec 'git add remote'");
    }
  }
  async initCommit() {
    await this.checkConflict();
    await this.checkCommit();
    if (await this.isRemoteMasterExist()) {
      await this.pullOrigin("master", {
        "--allow-unrelated-histories": null,
      });
    } else {
      await this.pushOrigin("master");
    }
  }

  async checkConflict() {
    const status = await this.git.status();
    if (status.conflicted.length > 0) {
      throw new Error("Code Conflict, please fix it and retry");
    }
    log.success("CheckConflict", "Good, the code has no conflict");
  }

  async checkCommit() {
    const status = await this.git.status();
    if (
      status.not_added.length > 0 ||
      status.created.length > 0 ||
      status.deleted.length > 0 ||
      status.modified.length > 0
      // status.renamed.length > 0
    ) {
      await this.git.add(status.not_added);
      await this.git.add(status.created);
      await this.git.add(status.deleted);
      await this.git.add(status.modified);
      // await this.git.add(status.renamed);
      let message;
      while (!message) {
        const res = await inquirer.prompt<{ message: string }>({
          name: "message",
          type: "input",
          message: "Please input commit message",
          default: "",
        });
        message = res.message;
      }
      await this.git.commit(message);
      log.success("CheckCommit", "Exec 'git add' and 'git commit'");
    }
  }

  async isRemoteMasterExist(): Promise<boolean> {
    return (
      (await this.git.listRemote(["--refs"])).indexOf("refs/heads/master") >= 0
    );
  }

  async pullOrigin(branchName: string, options = {}) {
    await this.git.pull("origin", branchName, options).catch((err) => {
      if (err.message.indexOf("Permission denied (publickey)") >= 0) {
        throw new Error(
          `Please copy you local 'ssh publickey' to ${this.gitServer.getSSHKeysUrl()}. (docs: ${this.gitServer.getSSHKeysHelpUrl()})`
        );
      } else {
        log.warn("GitPull", err.message);
      }
      log.error(
        "GitPull",
        "Please retry `migi publish`, if it still goes wrong, try delete `.git` flod and try again."
      );
      process.exit(0);
    });
    log.success("GitPull", `Exec 'git pull origin ${branchName}'`);
  }

  async pushOrigin(branchName: string) {
    await this.git.push("origin", branchName);
    log.success("GitPush", `Exec 'git push origin ${branchName}'`);
  }

  async checkVersion() {
    // 检测分支及版本号
    // 1. 如果远程分支还没有 `releaseVersion` 或 `devVersion > releaseVersion`, 则本地分支设为 `${VERSION_DEVELOP}/${devVersion}`
    // 2. 如果 `devVersion <= releaseVersion`, 则需要升级版本
    const remoteBranchList = await this.getRemoteBranchList(VERSION_RELEASE);
    let releaseVersion = null;
    if (remoteBranchList?.length > 0) {
      // 获取线上最新版本
      releaseVersion = remoteBranchList[0];
    }
    const devVersion = this.version;
    if (!releaseVersion || semver.gt(this.version, releaseVersion)) {
      this.branch = `${VERSION_DEVELOP}/${devVersion}`;
    } else {
      const { releaseType } = await inquirer.prompt<{
        releaseType: ReleaseType;
      }>({
        name: "releaseType",
        type: "list",
        choices: [
          {
            name: `Patch（${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "patch"
            )}）`,
            value: "patch",
          },
          {
            name: `Minor（${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "minor"
            )}）`,
            value: "minor",
          },
          {
            name: `Major（${releaseVersion} -> ${semver.inc(
              releaseVersion,
              "major"
            )}）`,
            value: "major",
          },
        ],
        default: "patch",
        message: "Update version",
      });
      const newVersion = semver.inc(releaseVersion, releaseType) as string;
      this.branch = `${VERSION_DEVELOP}/${newVersion}`;
      this.version = newVersion;
      this.syncVersionToPackageJson();
      log.success(
        "CheckVersion",
        `Update version from ${colors.green(devVersion)} to ${colors.green(
          releaseVersion
        )}`
      );
    }
    log.success("CheckVersion", `Using brach ${colors.green(this.branch)}`);
  }

  async getRemoteBranchList(
    version?: Version
  ): Promise<(string | undefined)[]> {
    // git ls-remote --refs
    const lsremote = await this.git.listRemote(["--refs"]);
    let reg: RegExp;
    if (version === VERSION_RELEASE) {
      reg = /.+?refs\/tags\/release\/(\d+\.\d+\.\d+)/g;
    } else {
      reg = /.+?refs\/heads\/dev\/(\d+\.\d+\.\d+)/g;
    }
    return lsremote
      .split("\n")
      .map((remote) => {
        const match = reg.exec(remote);
        reg.lastIndex = 0;
        if (match && semver.valid(match[1])) {
          return match[1];
        }
      })
      .filter((_) => _)
      .sort((a, b) => {
        if (!a || !b) return -1;
        if (semver.lte(b, a)) {
          if (a === b) return 0;
          return -1;
        }
        return 1;
      });
  }

  syncVersionToPackageJson() {
    const pkg = fse.readJsonSync(`${this.dir}/package.json`);
    if (pkg?.version !== this.version) {
      pkg.version = this.version;
      fse.writeJsonSync(`${this.dir}/package.json`, pkg, { spaces: 2 });
    }
  }

  async checkStash() {
    const stashList = await this.git.stashList();
    if (stashList.all.length > 0) {
      await this.git.stash(["pop"]);
      log.success("CheckStash", "Exec 'git stash pop'");
    } else {
      log.success("CheckStash", "stash list is empty, skip stash pop");
    }
  }

  async checkoutBranch(branch: string) {
    const localBranchList = await this.git.branchLocal();
    if (localBranchList.all.indexOf(branch) >= 0) {
      await this.git.checkout(branch);
    } else {
      await this.git.checkoutLocalBranch(branch);
    }
    log.success("CheckoutBranch", `Switch branch to ${colors.green(branch)}`);
  }

  async pullOriginMatserAndThisBranch() {
    // 合并远程master及this.branch至本地
    await this.pullOrigin("master");
    await this.checkConflict();
    const remoteBranchList = await this.getRemoteBranchList();
    if (remoteBranchList.indexOf(this.version) >= 0) {
      await this.pullOrigin(this.branch);
      await this.checkConflict();
    } else {
      log.notice(
        "PullOriginMatserAndThisBranch",
        `Remote branch ${colors.green(this.branch)} was not found`
      );
    }
  }

  async checkBuildDist() {
    // 检查是否有 `build` 命令，有则执行
    const pkg = this.getPackageJson();
    if (!pkg.scripts || !Object.keys(pkg.scripts).includes("build")) {
      throw new Error("`build` script was not found");
    }
    // if (this.buildCmd) {
    //   require("child_process").execSync(this.buildCmd, {
    //     cwd: this.dir,
    //   });
    // } else {
    //   require("child_process").execSync("npm run build", {
    //     cwd: this.dir,
    //   });
    // }
    execSync("npm run build", {
      cwd: this.dir,
    });
    log.success("CheckBuildDist", "Build success");
  }

  // 创建本地缓存文件
  // ~/.migi/.git/${filename}
  createCachePath(filename: string): string {
    const gitDir = path.resolve(this.cliHome, GIT_ROOT_DIR);
    const cachePath = path.resolve(gitDir, filename);
    fse.ensureDirSync(gitDir);
    return cachePath;
  }

  getPackageJson() {
    const pkgPath = path.resolve(this.dir, "package.json");
    if (!fse.existsSync(pkgPath)) {
      throw new Error("package.json 不存在！");
    }
    return fse.readJsonSync(pkgPath);
  }
}

function createGitServer(gitServer: string): GitServer {
  switch (gitServer) {
    case "github":
      return new Github();
    case "gitee":
      return new Gitee();
    case "gitlab":
      return new Gitlab();
    default:
      return new Github();
  }
}
