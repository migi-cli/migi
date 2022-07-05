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
  refreshGitServer?: boolean;
  refreshGitToken?: boolean;
  refreshGitOwner?: boolean;
}
