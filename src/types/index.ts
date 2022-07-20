export interface Migi {
  init(): void;
  beforeExec(): void;
  exec(): void;
  afterExec?(): void;
}

export interface PublishPrepareInfo {
  name: string;
  version: string;
  dir: string;
}

export interface BasePublishOptions {
  /**
   * 重置所有缓存
   */
  reset?: boolean;
  /**
   * 重置 git 缓存
   */
  resetGit?: boolean;
  /**
   * 重置 git own 缓存(适用于仅仅切换不同的带发布项目)
   */
  resetGitOwn?: boolean;
  /**
   * 重置发布平台缓存
   */
  resetPlatform?: boolean;
  /**
   * 是否是生产环境
   */
  prod?: boolean;
}

export interface SSHOptions {
  sshUser?: string;
  sshPassword?: string;
  sshIp?: string;
  sshPath?: string;
}

export type PublishOptions = BasePublishOptions & SSHOptions;
