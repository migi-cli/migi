import GitServer from "./GitServer";
import { ApiResult } from "./request";
import GitlabRequest from "./request/Gitlab";

export default class Gitlab extends GitServer {
  constructor() {
    super("gitlab");
  }
  get tokenHelpUrl(): string {
    return "https://git.133ec.com/profile/personal_access_tokens";
  }
  setToken(token: string): void {
    this.request = new GitlabRequest(token);
  }
  getUser() {
    return this.request.get("/user").then((response: ApiResult) => {
      return {
        login: response.username,
        id: response.id,
      };
    });
  }
  getOrgs() {
    return this.request
      .get("/groups", {
        all_available: true,
        per_page: 100,
      })
      .then((response: ApiResult[]) => {
        return response?.map((item) => ({
          login: item.name,
          id: item.id,
        }));
      });
  }
  getRepo(owner: string, repo: string) {
    if (owner === "org") {
      owner = "group";
    }
    return this.request
      .get("/projects", {
        search: repo,
      })
      .then((response: ApiResult[]) => {
        return response?.length
          ? response.filter((item) => item.namespace.kind === owner)
          : [];
      });
  }
  createRepo(name: string) {
    return this.request.post("/projects", {
      name,
    });
  }
  createOrgRepo(login: string, name: string) {
    return this.request.post("/projects", {
      name,
      namespace_id: login,
    });
  }
  getRemote(login: string, name: string) {
    return `ssh://git@git.133ec.com:20022/${login}/${name}.git`;
  }
  getSSHKeysUrl(): string {
    return "https://git.133ec.com/profile/keys";
  }
  getSSHKeysHelpUrl(): string {
    return "https://git.133ec.com/help/ssh/README";
  }
}
