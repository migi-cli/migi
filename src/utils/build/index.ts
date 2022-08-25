import inquirer from "inquirer";
import ora from "ora";
import io, { Socket } from "socket.io-client";
import { log } from "../log";
import { getOSS } from "../request";
import { HOST, PORT } from "../../config";
import { SSHOptions } from "../../types";
const WS_SERVER = `ws://${HOST}:${PORT}`;

type CloudBuildOptions = SSHOptions & {
  /**
   * prod/dev
   */
  type: string;
  /**
   * oss/nginx
   */
  platform: string;
  /**
   * 项目名称
   */
  name: string;
  /**
   * 项目版本
   */
  version: string;
  /**
   * git地址
   */
  remote: string;
  /**
   * 分支名
   */
  branch: string;
};

export default class CloudBuild {
  private type: string;
  private platform: string;
  private name: string;
  private version: string;
  private remote: string;
  private branch: string;
  private socket!: Socket;
  private sshIp?: string;
  private sshUser?: string;
  private sshPassword?: string;
  private sshPath?: string;
  constructor({
    platform,
    type,
    name,
    version,
    remote,
    branch,
    sshIp,
    sshUser,
    sshPassword,
    sshPath,
  }: CloudBuildOptions) {
    this.type = type;
    this.platform = platform;
    this.name = name;
    this.version = version;
    this.remote = remote;
    this.branch = branch;
    this.sshIp = sshIp;
    this.sshUser = sshUser;
    this.sshPassword = sshPassword;
    this.sshPath = sshPath;
  }

  async prepare() {
    if (this.platform === "oss") {
      // 如果已经发布过项目，那么判断是否需要覆盖
      const ossProject = await getOSS({
        name: this.name,
        type: this.type,
      });

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
  }

  async createWebsocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(WS_SERVER, {
        query: {
          type: this.type,
          platform: this.platform,
          name: this.name,
          version: this.version,
          branch: this.branch,
          remote: this.remote,
          sshIp: this.sshIp,
          sshUser: this.sshUser,
          sshPassword: this.sshPassword,
          sshPath: this.sshPath,
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
        log.success("Websocket", `Connect to ${WS_SERVER}. socketID: ${id}`);
        resolve();
      });
      this.socket.on("disconnect", () => {
        log.notice("Websocket", "Disconnected");
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
      let loading: ora.Ora;
      // 服务端开启云构建的过程中会不断emit build事件
      this.socket.on("build", ({ action, message }) => {
        if (!["success", "fail"].includes(action)) {
          if (action.includes("start")) {
            loading = ora(message);
            loading.start();
          } else if (action.includes("end")) {
            if (message.includes("成功")) {
              loading.succeed(message);
            } else {
              loading.fail(message);
            }
          }
        } else {
          loading?.stop();
          if (action === "success") {
            log.success("Success", message);
          } else {
            log.error("Fail", message);
          }
        }
      });

      // ssh密码(废弃，采用配置的方式)
      // this.socket.on("inputPassword", async (cb) => {
      //   loading?.stopAndPersist();
      //   let password;
      //   while (!password) {
      //     const res = await inquirer.prompt<{ password: string }>({
      //       name: "password",
      //       type: "password",
      //       message: "Please input ssh password",
      //       default: "",
      //     });
      //     password = res.password;
      //   }

      //   loading?.start();
      //   cb(password);
      // });

      // 服务端云构建完成后会自动断开websocket连接
      this.socket.on("disconnect", () => {
        resolve();
      });
      this.socket.on("error", (err) => {
        reject(err);
      });
    });
  }
}
