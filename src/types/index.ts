export interface Migi {
  init(): void;
  beforeExec(): void;
  exec(): void;
  afterExec?(): void;
}
