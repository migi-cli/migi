import GitServer from "./GitServer";
import { ApiResult } from "./request";
import GiteeRequest from "./request/Gitee";

export default class Gitee extends GitServer {
  constructor() {
    super("gitee");
  }
  get tokenHelpUrl(): string {
    return "https://gitee.com/profile/personal_access_tokens";
  }
  getUser() {
    return this.request.get("/user").then((response: ApiResult) => {
      return response;
    });
  }
  getOrgs() {
    return this.request
      .get("/user/orgs", {
        page: 1,
        per_page: 100,
        admin: true,
      })
      .then((response: ApiResult[]) => {
        return response;
      });
  }
  getRepo(owner: string, repo: string) {
    return this.request.get(`/repos/${owner}/${repo}`).then((response: any) => {
      return typeof response === "string" && response.includes("Not Found")
        ? null
        : response;
    });
  }
  createRepo(name: string) {
    return this.request.post("/user/repos", {
      name,
    });
  }
  createOrgRepo(login: string, name: string) {
    return this.request.post(`/orgs/${login}/repos`, {
      name,
    });
  }
  getRemote(login: string, name: string) {
    return `git@gitee.com:${login}/${name}.git`;
  }
  getSSHKeysUrl(): string {
    return "https://gitee.com/profile/sshkeys";
  }
  getSSHKeysHelpUrl(): string {
    return "https://gitee.com/help/articles/4191";
  }
  setToken(token: string): void {
    this.request = new GiteeRequest(token);
  }
}
