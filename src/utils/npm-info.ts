import axios from "axios";
import urlJoin from "url-join";
import compareVersions, { satisfies } from "compare-versions";
import { DEFAULT_REGISTRY } from "../constants";

async function getNpmInfo(npmName: string, registry = DEFAULT_REGISTRY) {
  if (!npmName) {
    return null;
  }
  const url = urlJoin(registry, npmName);
  return axios
    .get(url)
    .then((res: any) => {
      if (res.status === 200) {
        return res.data;
      } else {
        return null;
      }
    })
    .catch((e: any) => {
      return Promise.reject(e);
    });
}

async function getNpmVersions(npmName: string, registry = DEFAULT_REGISTRY) {
  const info = await getNpmInfo(npmName, registry);
  if (info?.versions) {
    return Object.keys(info.versions);
  } else {
    return [];
  }
}

/**
 *
 *
 * @param {string} npmName
 * @param {string} version
 * @param {string} [registry=DEFAULT_REGISTRY]
 * @return {string}
 */
async function getSemverNpmVersions(
  npmName: string,
  version: string,
  registry = DEFAULT_REGISTRY
) {
  const versions = await getNpmVersions(npmName, registry);
  const sortedVersions = versions
    .filter((v) => satisfies(v, `^${version}`))
    .sort(compareVersions);

  if (sortedVersions?.length > 0) {
    return sortedVersions[sortedVersions.length - 1];
  }
}

export { getNpmInfo, getNpmVersions, getSemverNpmVersions };
