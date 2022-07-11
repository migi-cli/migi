import inquirer from "inquirer";
import { promisify } from "util";
import path from "path";
import fse from "fs-extra";
import { homedir } from "os";
import ora from "ora";
import { log, useRequest, renderEjs } from "../utils";
import { Migi } from "../types";
const downloadGitRepo = promisify(require("download-git-repo"));
const userHome = homedir();

export interface CreateOptions {
  org: string;
  refreshTemplate?: boolean;
}

export interface CreatePrepareInfo {
  template: string;
  name: string;
  description: string;
  author: string;
  version: string;
}

interface Repo {
  id: number;
  name: string;
}

class MigiCreate implements Migi {
  private options: CreateOptions;
  private prepareInfo: CreatePrepareInfo = {} as CreatePrepareInfo;
  private cachePath: string = "";
  constructor(options: CreateOptions) {
    this.options = options;
    this.init();
  }

  async init() {
    await this.beforeExec();
    await this.exec();
    await this.afterExec();
  }

  async beforeExec() {
    const { org } = this.options;
    let data = await useRequest<Repo[]>(
      `https://api.github.com/orgs/${org}/repos`,
      "Loading template"
    );

    const questions = genQuestions(data);
    this.prepareInfo = await inquirer.prompt<CreatePrepareInfo>(questions);
  }

  async exec() {
    await this.download();
    const ok = await this.copy();
    ok && this.writeFile();
  }
  async afterExec() {}

  async download() {
    const { org } = this.options;
    const { template } = this.prepareInfo;
    const api = `${org}/${template}`;

    const cachePath = path.join(userHome, process.env.MIGI_CLI_HOME!, template);

    if (!fse.pathExistsSync(cachePath) || this.options.refreshTemplate) {
      const loading = ora("Downloading repo");
      loading.start();
      try {
        await downloadGitRepo(api, cachePath);
        loading.succeed();
      } catch (e: any) {
        throw new Error(e.message || "Download repo failed");
      }
    }
    this.cachePath = cachePath;
  }

  async copy(): Promise<boolean> {
    const toPath = path.join(process.cwd(), this.prepareInfo.name);
    if (!fse.pathExistsSync(toPath)) {
      fse.copySync(this.cachePath, toPath);
      return true;
    } else {
      const { force } = await judgeCoverage();
      if (force) {
        fse.removeSync(toPath);
        fse.copySync(this.cachePath, toPath);
      }
      return force;
    }
  }

  async writeFile() {
    // ejs批量替换模板
    await renderEjs(process.cwd(), this.prepareInfo);
    log.success("Create", path.join(process.cwd(), this.prepareInfo.name));
  }
}

export function create(options: CreateOptions) {
  new MigiCreate(options);
}

function genQuestions(repos: Repo[]) {
  return [
    {
      name: "template",
      type: "list",
      message: "Please select a template",
      choices: repos,
    },
    {
      name: "name",
      type: "input",
      message: "Project Name",
      default() {
        return "ts-rollup-starter";
      },
    },
    {
      name: "description",
      type: "input",
      message: "Project Description",
      default() {
        return "A TypeScript library build with rollup";
      },
    },
    {
      name: "author",
      type: "input",
      message: "Author",
      default() {
        return "Your Name <you@example.com>";
      },
    },
    {
      name: "version",
      type: "input",
      message: "Version",
      default() {
        return "0.0.1";
      },
    },
  ];
}

function judgeCoverage() {
  return inquirer.prompt({
    name: "force",
    type: "confirm",
    message: "Found a same directory, force to coverage it?",
    default: false,
  });
}
