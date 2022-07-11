import axios, { AxiosInstance } from "axios";
import { Request } from ".";

const BASE_URL = "https://gitee.com/api/v5";

export default class GiteeRequest implements Request {
  token: string;
  service: AxiosInstance;
  constructor(token: string) {
    this.token = token;
    this.service = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
    this.service.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // TODO: catch error
        if (error.response?.data) {
          return error.response.data.message;
        } else {
          return Promise.reject(error);
        }
      }
    );
  }
  get(url: string, data: any, headers: any) {
    return this.service({
      url,
      params: {
        ...data,
        access_token: this.token,
      },
      method: "get",
      headers,
    });
  }

  post(url: string, data: any, headers: any) {
    return this.service({
      url,
      data: {
        ...data,
        access_token: this.token,
      },
      method: "post",
      headers,
    });
  }
}
