import path from "path";
import fse from "fs-extra";
import { SSHOptions } from "../types";

export function readMigirc(): SSHOptions {
  const rcPath = path.resolve(process.cwd(), ".migirc");
  if (!fse.pathExistsSync(rcPath)) return {};
  const config = fse.readJsonSync(rcPath);
  return config;
}
