import colors from "colors";
import { compare } from "compare-versions";
import checkRoot from "root-check";
import { homedir } from "os";
import fse from "fs-extra";
import dotenv from "dotenv";
import path from "path";
import pkg from "../package.json";
import { LOW_NODE_VERSION } from "./constants";
import { getSemverNpmVersions, log, ensureCliHome } from "./utils";
const userHome = homedir();

export default async function prepare() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    checkRoot(); // process.geteuid() 普通启动为501，sudo启动为0，root-check会自动降级，防止出现文件读写异常
    checkHome();
    checkEnv();
    // await checkUpdate();
  } catch (e: any) {
    throw new Error(e.message || "Enviorment prepare failed");
  }
}

function checkPkgVersion() {
  log.info("Version", pkg.version);
}

function checkNodeVersion() {
  const currentNodeVersion = process.version;
  if (compare(currentNodeVersion, LOW_NODE_VERSION, "<")) {
    throw new Error(
      colors.red(
        `Your Node version is too slow (${currentNodeVersion}), please update to at leaset ${LOW_NODE_VERSION}`
      )
    );
  }
}

function checkHome() {
  if (!fse.pathExistsSync(userHome)) {
    throw new Error(colors.red("The `homedir` is not found"));
  }
}

function checkEnv() {
  const envPath = path.resolve(userHome, ".env");
  if (fse.pathExistsSync(envPath)) {
    // Load env
    dotenv.config({ path: envPath });
  }
  ensureCliHome();
}

async function checkUpdate() {
  const npmName = pkg.name;
  const currentVersion = pkg.version;
  const latestVersion = await getSemverNpmVersions(npmName, currentVersion);
  if (latestVersion && compare(latestVersion, currentVersion, ">")) {
    log.notice(
      "Update",
      colors.yellow(`New version released（${npmName}@${latestVersion}）`)
    );
  }
}
