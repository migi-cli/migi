import GitServer from "./GitServer";
import { ApiResult } from "./request";
import GithubRequest from "./request/Github";

export default class Github extends GitServer {
  constructor() {
    super("github");
  }
  get tokenHelpUrl(): string {
    return "https://github.com/settings/tokens";
  }
  setToken(token: string) {
    this.request = new GithubRequest(token);
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
      return response.status === 404 ? null : response;
    });
  }
  createRepo(name: string) {
    return this.request.post(
      "/user/repos",
      {
        name,
      },
      {
        Accept: "application/vnd.github.v3+json",
      }
    );
  }
  createOrgRepo(login: string, name: string) {
    return this.request.post(
      `/orgs/${login}/repos`,
      {
        name,
      },
      {
        Accept: "application/vnd.github.v3+json",
      }
    );
  }
  getRemote(login: string, name: string) {
    return `git@github.com:${login}/${name}.git`;
  }
  getSSHKeysUrl(): void {
    throw new Error("Method not implemented.");
  }
  getSSHKeysHelpUrl(): void {
    throw new Error("Method not implemented.");
  }
}
