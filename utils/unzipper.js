import fs from "fs";
import unzipper from "unzipper";
import path from "path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function unZipFiles(filePath, zipFileName, finalFolderName) {
    const fullZipPath = path.join(filePath, zipFileName);
    const tempDirName = `temp_${Date.now()}`;
    const tempDirPath = path.join(filePath, tempDirName);

    if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath);
    }

    return new Promise((resolve, reject) => {

        const stream = fs.createReadStream(fullZipPath);

        stream.pipe(unzipper.Extract({ path: tempDirPath })).on("close", async () => {
            stream.close()
            await sleep(10000);
            try {
                const content = await fs.promises.readdir(tempDirPath);
                if (content.length === 0) {
                    throw new Error("Error Zip file was empty");
                } else if (content.length > 1) {
                    throw new Error("Zip file should contain only one file.");
                }
                const innerFolderName = content[0];
                const oldPath = path.join(tempDirPath, innerFolderName)
                const newPath = path.join(filePath, finalFolderName);
                
                await fs.promises.rename(oldPath, newPath);

                await fs.promises.unlink(fullZipPath);
                await fs.promises.rmdir(tempDirPath);
                resolve(true)
            } catch (error) {
                await fs.promises.rm(tempDirPath, { recursive: true, force: true }).catch(() => { });
                await fs.promises.unlink(fullZipPath).catch(() => { });
                reject(error);
            }
        }).on("error", (err) => reject(err));
    })
}

export default unZipFiles;