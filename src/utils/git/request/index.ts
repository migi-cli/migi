import axios, { AxiosInstance } from "axios";

export interface ApiResult {
  login: string;
  id: number;
}

export interface Request {
  get(url: string, data?: any, headers?: any): any;
  post(url: string, data?: any, headers?: any): any;
}
