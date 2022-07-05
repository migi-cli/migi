import fs from "fs";

export function writeFile(
  path: string,
  data: string,
  { rewrite = true } = {}
): boolean {
  if (fs.existsSync(path)) {
    if (rewrite) {
      fs.writeFileSync(path, data);
      return true;
    } else {
      return false;
    }
  } else {
    fs.writeFileSync(path, data);
    return true;
  }
}

export function readFile(path: string): string | null | undefined {
  if (fs.existsSync(path)) {
    const buffer = fs.readFileSync(path);
    if (buffer) {
      return buffer.toString();
    }
  } else {
    return null;
  }
}
