import { ApiResult, Request } from "./request";

export default abstract class GitServer {
  type: string;
  request!: Request;
  constructor(type: string) {
    this.type = type;
  }

  abstract get tokenHelpUrl(): string;
  abstract setToken(token: string): void;
  abstract getUser(): ApiResult;
  abstract getOrgs(): ApiResult[];
  abstract getRepo(owner: string, repo: string): any;
  abstract createRepo(name: string): any;
  abstract createOrgRepo(login: string, name: string): any;
  abstract getRemote(login: string, name: string): string;
  abstract getSSHKeysUrl(): string;
  abstract getSSHKeysHelpUrl(): string;
}
