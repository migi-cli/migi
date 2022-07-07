// const io = require("socket.io-client");
// const get = require("lodash/get");
// const { parseMsg } = require("./parse");
// const log = require("../log");
// const getOSSProject = require("./getOSSProject");
// const inquirer = require("../inquirer");
import inquirer from "inquirer";
import io, { Socket } from "socket.io-client";
import { log } from "../log";
import request from "../request";

const WS_SERVER = "ws://localhost:3000";
const FAILED_CODE = [
  "prepare failed",
  "download failed",
  "build failed",
  "pre-publish failed",
  "publish failed",
];

async function getOSSProject(params: any) {
  return request({
    url: "/project/oss",
    params,
  }) as any;
}

interface CloudBuildOptions {
  prod: boolean;
  platform: string;
  name: string;
  version: string;
  remote: string;
  branch: string;
}

export default class CloudBuild {
  private prod: boolean;
  private platform: string;
  private name: string;
  private version: string;
  private remote: string;
  private branch: string;
  private socket!: Socket;
  constructor({
    platform,
    prod,
    name,
    version,
    remote,
    branch,
  }: CloudBuildOptions) {
    this.prod = prod;
    this.platform = platform;
    this.name = name;
    this.version = version;
    this.remote = remote;
    this.branch = branch;
  }

  async prepare() {
    // 如果已经发布过项目，那么判断是否需要覆盖
    const ossProject = await getOSSProject({
      name: this.name,
      type: this.prod ? "prod" : "dev",
    });
    console.log(ossProject);

    if (ossProject?.length > 0) {
      const { cover } = await inquirer.prompt<{ cover: boolean }>({
        name: "cover",
        type: "confirm",
        message: `Project ${this.name} was existed, force coverage it?`,
        default: true,
      });
      if (!cover) {
        throw new Error("Cancel publish");
      }
    }
  }

  async createWebsocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(WS_SERVER, {
        query: {
          prod: this.prod,
          platform: this.platform,
          name: this.name,
          version: this.version,
          branch: this.branch,
          remote: this.remote,
        },
        transports: ["websocket"],
      });

      // 超时及连接出错均需断开
      const disconnect = () => {
        this.socket.disconnect();
        this.socket.close();
      };

      this.socket.on("connect", () => {
        const id = this.socket.id;
        log.success("Websocket", `Connected. socketID: ${id}`);

        // this.socket.on(id, (msg) => {
        //   const parsedMsg = parseMsg(msg);
        //   log.success(parsedMsg.action, parsedMsg.message);
        //   console.log(msg);
        // });
        resolve();
      });
      this.socket.on("disconnect", () => {
        log.success("Websocket", "Disconnected");
        disconnect();
      });
      this.socket.on("error", (err) => {
        log.error("Websocket", err);
        disconnect();
        reject(err);
      });
    });
  }

  async build(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 开始构建
    });
  }
}
