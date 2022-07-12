import axios from "axios";
import { HOST, PORT } from "../config";
const BASE_URL = `http://${HOST}:${PORT}`;

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// export default request;

export async function getOSS(params: { name: string; type: string }) {
  return request({
    url: "/migi/oss",
    method: "get",
    params,
  }) as any;
}
