import axios from "axios";
import ora from "ora";

type Fn = (...args: any[]) => Promise<any>;

export function useLoading(fn: Fn, message: string): Fn {
  return async (...args: any[]) => {
    const loading = ora(message);
    loading.start();
    let res = {};
    try {
      res = await fn(...args);
      loading.succeed();
    } catch (e) {
      console.log(e);
      loading.fail();
    }
    return res;
  };
}

export async function useRequest<T>(
  api: string,
  msg: string = "Fetching"
): Promise<T> {
  return new Promise((resolve, reject) => {
    const loading = ora(msg);
    loading.start();
    axios
      .get(api)
      .then((res) => {
        loading.succeed();
        resolve(res.data);
      })
      .catch((e) => {
        loading.fail("Fetch failed, please retry");
        reject(e);
      });
  });
}
