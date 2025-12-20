import docker from "../connection/docker.js";
import demuxChunk from "../helper/demux.js";
import path from "path";
import fs from "fs";

const activeLoggers = new Set(); //idempotency

const attachLogs = async (containerName, baseUrl, aliases) => {
  let container;
  try {
    if (activeLoggers.has(containerName)) {
      return;
    }

    container = docker.getContainer(containerName);

    activeLoggers.add(containerName);

    const logStream = await container.logs({
      follow: true,
      stdout: false,
      stderr: true,
    });

    let errorCount = 0;
    let maxErrorCount = 50;

    const resetTimer = setInterval(() => {
      errorCount = 0;
    }, 600000);

    const errorLogStream = fs.createWriteStream(
      path.join(baseUrl, "error_logs.txt"),
      { flags: "a" }
    );

    logStream.on("data", (chunk) => {
      if (errorCount > maxErrorCount) return;

      const cleanErrMsg = demuxChunk(chunk);

      cleanErrMsg.forEach((err) => {
        if (errorCount > maxErrorCount) return;
        errorCount++;
        errorLogStream.write(`${aliases} : ${err}`);
      });
    });

    logStream.on("end", () => {
      clearInterval(resetTimer);
      activeLoggers.delete(containerName);
      errorLogStream.end();
    });
  } catch (error) {
    activeLoggers.delete(containerName);
    console.error(`Error Attaching logs to ${aliases}: `, error);
  }
};

export default attachLogs;
