import { DEFAULT_CLI_HOME } from "../constants";
import fse from "fs-extra";
import path from "path";
import colors from "colors";
import { homedir } from "os";
const userHome = homedir();

export function ensureCliHome(): string {
  // User can custom CLI_HOME by set `MIGI_CLI_HOME=${custom_cli_home}` in global `.env` file.
  if (!process.env.MIGI_CLI_HOME) {
    process.env.MIGI_CLI_HOME = DEFAULT_CLI_HOME;
  }
  const cliHomePath = path.join(userHome, process.env.MIGI_CLI_HOME);
  // Create cli home directory
  fse.ensureDirSync(cliHomePath);

  if (!fse.pathExistsSync(cliHomePath)) {
    throw new Error(colors.red("The `MIGI_CLI_HOME` is not found"));
  }

  return cliHomePath;
}
