import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { minimatch } from "minimatch";

function shouldIgnore(filePath, patterns) {
    return patterns.some(pattern => minimatch(filePath, pattern, { dot: true }));
}


function hashDirectory(rootDir, ignore) {
    const hash = createHash("sha256");

    function walk(currentDir) {
        const files = fs.readdirSync(currentDir).sort();
        for (const file of files) {
            const fullPath = path.join(currentDir, file);
            const relativePath = path.relative(rootDir, fullPath);
            if (shouldIgnore(relativePath, ignore)) {
                continue;
            }
            const stat = fs.statSync(fullPath)

            if (stat.isDirectory()) {
                walk(fullPath)
            } else {
                const fileContent = fs.readFileSync(fullPath);
                hash.update(fileContent);
            }
        }
    }
    walk(rootDir);
    return hash.digest("hex")
}

export default hashDirectory;