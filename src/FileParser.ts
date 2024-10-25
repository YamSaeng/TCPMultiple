import { config } from "./config/Config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

class FileParser {
    private static gInstance: any = null;
    private __filename: string;
    private __dirname: string;

    static GetInstance() {
        if (FileParser.gInstance == null) {
            FileParser.gInstance = new FileParser;
        }

        return FileParser.gInstance;
    }

    private constructor() {
        this.__filename = fileURLToPath(import.meta.url);
        this.__dirname = path.dirname(this.__filename);
    }

    public GetAllFiles(dir: any, findFileName: string, fileList :any = []) {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const filePath = path.join(dir, file);

            if (fs.statSync(filePath).isDirectory()) {
                this.GetAllFiles(filePath, findFileName, fileList);
            }
            else if (path.extname(file) === findFileName) {
                fileList.push(filePath);
            }
        });

        return fileList;
    }

    public GetDir(dir: string) {
        const root = path.join(this.__dirname, dir);
        return root;
    }
}

export default FileParser;
