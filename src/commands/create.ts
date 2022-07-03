import inquirer from "inquirer";
import { promisify } from "util";
import path from "path";
import fse from "fs-extra";
import { homedir } from "os";
import { log, useRequest } from "../utils";
import { Migi } from "../types";
import ora from "ora";
const downloadGitRepo = promisify(require("download-git-repo"));
const userHome = homedir();

export interface CreateOptions {
  org: string;
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

    data = data.filter((repo) => repo.name !== "xietian-cli");

    const questions = genQuestions(data);
    this.prepareInfo = await inquirer.prompt<CreatePrepareInfo>(questions);
  }

  async exec() {
    await this.download();
    const ok = await this.copy();
    ok && this.renderEjs();
  }
  async afterExec() {}

  async download() {
    const { org } = this.options;
    const { template } = this.prepareInfo;
    const api = `${org}/${template}`;

    const cachePath = path.join(userHome, process.env.MIGI_CLI_HOME!, template);

    if (!fse.pathExistsSync(cachePath)) {
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

  renderEjs() {
    const { name, author, description, version } = this.prepareInfo;
    const packagejsonPath = path.join(process.cwd(), `${name}/package.json`);

    const packageJson = Object.assign(require(packagejsonPath), {
      name: name,
      author: author,
      description: description,
      version: version,
    });
    fse.outputFileSync(packagejsonPath, JSON.stringify(packageJson, null, 2));

    const readmePath = path.join(process.cwd(), `./${name}/README.md`);

    const data = fse
      .readFileSync(readmePath)
      .toString()
      .replace("PROJECT_NAME", name)
      .replace("DESCRIPTION", description);

    fse.outputFileSync(readmePath, data);

    log.success("Create", path.join(process.cwd(), name));
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
