import { AxiosInstance } from "axios";

export interface ApiResult {
  id: number;
  login: string; // github/gitee
  username: string; // gitlab
  name: string; // gitlab
  // gitlab
  namespace: {
    kind: string;
  };
}

export interface Request {
  token: string;
  service: AxiosInstance;
  get(url: string, data?: any, headers?: any): any;
  post(url: string, data?: any, headers?: any): any;
}
