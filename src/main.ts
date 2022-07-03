import { cac } from "cac";
import pkg from "../package.json";
import { log } from "./utils";
import { create, publish } from "./commands";
import { DEFAULT_ORG } from "./constants";
import prepare from "./prepare";
const cli = cac();

export default async function main() {
  try {
    await prepare();
    registerCommand();
  } catch (e: any) {
    log.error("Error", e.message);
  }
}

function registerCommand() {
  cli
    .command("create", "[Create project]")
    .alias("c")
    .option("--org <orgName>", "Github Org Name", {
      default: DEFAULT_ORG,
    })
    .action(create);

  cli.command("publish", "[Publish project]").alias("p").action(publish);

  cli.help();
  cli.version(pkg.version);

  cli.parse();
}
