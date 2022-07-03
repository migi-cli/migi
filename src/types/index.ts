export interface Migi {
  beforeExec(): void;
  exec(): void;
  afterExec?(): void;
}
