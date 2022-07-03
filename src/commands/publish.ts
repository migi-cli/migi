import path from "path";
import colors from "colors";
import fse from "fs-extra";
import { Migi } from "../types";
import { Git, log } from "../utils";

interface PublishOptions {}

interface PublishPrepareInfo {
  name: string;
  version: string;
  dir: string;
}

class MigiPublish implements Migi {
  private options: PublishOptions;
  private prepareInfo: PublishPrepareInfo = {} as PublishPrepareInfo;

  constructor(options: PublishOptions) {
    this.options = options;
    this.init();
  }

  async init() {
    this.beforeExec();
    await this.exec();
  }

  beforeExec() {
    const dir = process.cwd();
    const pkgPath = path.resolve(dir, "package.json");
    if (!fse.existsSync(pkgPath)) {
      throw new Error("`package.json` not found");
    }
    const pkg = fse.readJsonSync(pkgPath);
    const { name, version } = pkg;
    this.prepareInfo = { name, version, dir };
  }

  async exec() {
    const startTime = new Date().getTime();

    const git = new Git();
    log.info("Publish", colors.cyan("Checking Git Config"));
    await git.precommit();
    log.info("Publish", colors.cyan("Commting Code"));
    await git.commit();
    log.info("Publish", colors.cyan("Running CI/CD"));
    await git.publish();
    const endTime = new Date().getTime();
    log.info(
      "Publish",
      colors.green(
        "Finished in " + Math.floor((endTime - startTime) / 1000) + "s"
      )
    );
  }
}

export function publish(options: PublishOptions) {
  new MigiPublish(options);
}
