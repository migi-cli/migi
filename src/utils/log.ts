import log from "npmlog";
import pkg from "../../package.json";

// default level: under this level's log will not be print
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "info";

// custom level's methods and style
log.addLevel("success", 2000, { fg: "green", bold: true });

// custom heading
log.heading = pkg.name;
log.headingStyle = { fg: "cyan" };

export { log };
