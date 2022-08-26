import path from "path";
import fse from "fs-extra";
import { log, readFile } from "../utils";
import inquirer from "inquirer";
import { homedir } from "os";
const userHome = homedir();

interface ClearOptions {
  template: boolean;
  git: boolean;
}

function list() {
  // 列出 .migi下的`git/template`缓存文件夹下的内容
  const templatePath = getCachePath("template");

  const templates = fse.pathExistsSync(templatePath)
    ? fse.readdirSync(templatePath)
    : [];
  log.info("template", JSON.stringify(templates));

  const gitPath = getCachePath("git");
  const gitInfos = fse.pathExistsSync(gitPath) ? fse.readdirSync(gitPath) : [];
  gitInfos.forEach((info) => {
    const filePath = path.join(gitPath, info);
    const content = readFile(filePath);
    log.info(info, content!);
  });
}

async function clear(options: ClearOptions) {
  const ok = await confirmClear();
  if (!ok) return;
  const { template, git } = options;
  if (template && !git) {
    clearTemplate();
  } else if (git && !template) {
    clearGit();
  } else {
    clearTemplate();
    clearGit();
  }
}

async function clearTemplate() {
  fse.removeSync(getCachePath("template"));
  log.success("Deleted", "`template` cache");
}
function clearGit() {
  fse.removeSync(getCachePath("git"));
  log.success("Deleted", "`git` cache");
}
async function confirmClear(): Promise<boolean> {
  const { ok } = await inquirer.prompt<{ ok: boolean }>({
    name: "ok",
    type: "confirm",
    message: "Confirm to clear the cache?",
    default: true,
  });
  return ok;
}
function getCachePath(dir: string): string {
  return path.resolve(userHome, process.env.MIGI_CLI_HOME!, dir);
}

export { list as cacheList, clear as cacheClear };
