import path from "path";
import fse from "fs-extra";
import { SSHOptions } from "../types";

export function readMigirc(isProd: boolean = false): SSHOptions {
  const rcPath = path.resolve(process.cwd(), ".migirc");
  if (!fse.pathExistsSync(rcPath)) return {};
  const config = fse.readJsonSync(rcPath);
  if (isProd && !config.production) {
    throw new Error(
      "Your are trying to publish to production, but the `production` field is missed in `.migirc`"
    );
  }
  if (!isProd && !config.development) {
    throw new Error(
      "Your are trying to publish to development, but the `development` field is missed in `.migirc`"
    );
  }
  return isProd ? config.production : config.development;
}
