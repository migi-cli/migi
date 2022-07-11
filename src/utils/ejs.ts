import path from "path";
import glob from "glob";
import ejs from "ejs";
import fse from "fs-extra";
import { CreatePrepareInfo } from "../commands";

type ejsData = Omit<CreatePrepareInfo, "template">;

export async function renderEjs(
  dir: string,
  data: ejsData,
  diableFormatDotFile = false
): Promise<void> {
  return new Promise((resolve, reject) => {
    glob(
      "**",
      {
        cwd: dir,
        nodir: true,
        ignore: "**/node_modules/**",
      },
      (err, files) => {
        if (err) {
          return reject(err);
        }

        Promise.all(
          files.map((file) => {
            const filename = path.join(dir, file);
            return renderFile(filename, data, diableFormatDotFile);
          })
        )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
  });
}

function renderFile(filepath: string, data: any, diableFormatDotFile: boolean) {
  let filename = path.basename(filepath);

  if (filename.indexOf(".png") !== -1 || filename.indexOf(".jpg") !== -1) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    ejs.renderFile(filepath, data, (err, result) => {
      if (err) {
        return reject(err);
      }

      if (/^_package.json/.test(filename)) {
        filename = filename.replace("_package.json", "package.json");
        fse.removeSync(filepath);
      }

      if (/\.ejs$/.test(filepath)) {
        filename = filename.replace(/\.ejs$/, "");
        fse.removeSync(filepath);
      }

      if (!diableFormatDotFile && /^_/.test(filename)) {
        filename = filename.replace(/^_/, ".");
        fse.removeSync(filepath);
      }

      const newFilepath = path.join(filepath, "../", filename);
      fse.writeFileSync(newFilepath, result);
      resolve(newFilepath);
    });
  });
}
