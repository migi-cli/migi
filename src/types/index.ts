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
  reset?: boolean;
  resetGit?: boolean;
  resetPlatform?: boolean;
  prod?: boolean;
}

export interface SSHOptions {
  sshUser?: string;
  sshIp?: string;
  sshPath?: string;
}

export type PublishOptions = BasePublishOptions & SSHOptions;
