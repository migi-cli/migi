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

export interface PublishOptions {
  reset?: boolean;
  resetGit?: boolean;
  resetPlatform?: boolean;
  sshUser?: string;
  sshIp?: string;
  sshPath?: string;
  prod?: boolean;
}
