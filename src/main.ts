import { cac } from "cac";
import pkg from "../package.json";
import { log } from "./utils";
import { create, publish, cacheList, cacheClear } from "./commands";
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
    .option(
      "--refreshTemplate",
      "Force use remote template instead of local cache"
    )
    .action(create);

  cli
    .command("publish", "[Publish project]")
    .alias("p")
    .option("--reset", "Reset both `git config` and `publish platform`")
    .option(
      "--resetGit",
      "Reset `~/migi/.git/.gitserver`/`~/migi/.git/.gittoken`/`~/migi/.git/.gitown`"
    )
    .option("--resetGitOwn", "Reset `~/migi/.git/.gitown`")
    .option("--resetPlatform", "Reset `~/migi/.git/.publishplatform`")
    .option("--sshUser <ssh user>", "ssh user")
    .option("--sshPassword <ssh password>", "ssh password")
    .option("--sshIp <ssh ip>", "ssh ip")
    .option("--sshPath <ssh path>", "ssh path")
    .option("--prod", "Publish to production")
    .action(publish);

  cli.command("cache ls", "List the cache of Migi").action(cacheList);
  cli.command("cache clear", "Clear the cache of Migi").action(cacheClear);

  cli.help();
  cli.version(pkg.version);

  cli.parse();
}
