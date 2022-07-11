import axios from "axios";

const BASE_URL = "http://localhost:3000";

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
