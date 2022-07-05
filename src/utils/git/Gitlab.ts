import GitServer from "./GitServer";
import { ApiResult } from "./request";

export default class Gitlab extends GitServer {
  constructor() {
    super("gitlab");
  }
  get tokenHelpUrl(): string {
    throw new Error("Method not implemented.");
  }
  getUser() {
    return {} as ApiResult;
  }
  getOrgs() {
    return {} as ApiResult[];
  }
  getRepo(): void {
    throw new Error("Method not implemented.");
  }
  createRepo(): void {
    throw new Error("Method not implemented.");
  }
  createOrgRepo(): void {
    throw new Error("Method not implemented.");
  }
  getRemote(login: string, name: string) {
    return "";
  }
  getSSHKeysUrl(): void {
    throw new Error("Method not implemented.");
  }
  getSSHKeysHelpUrl(): void {
    throw new Error("Method not implemented.");
  }
  setToken(): void {
    throw new Error("Method not implemented.");
  }
}
