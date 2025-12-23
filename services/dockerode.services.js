import tar from "tar-fs";
import docker from "../connection/docker.js";
import { handleDeleteFolder } from "../helper/deleteFolder.js";
import Image from "../model/image.js";

const buildImageStream = (tarStream, imageName) => {
  return new Promise((resolve, reject) => {
    const buildTimeout = setTimeout(() => {
      reject(new Error("Build timed out"));
    }, 150000); // 2.5 mins
    docker.buildImage(tarStream, { t: imageName }, (err, stream) => {
      if (err) return reject(err);

      const onProgress = (event) => {
        if (event.stream) process.stdout.write(event.stream); // TODO: WebSocket
        if (event.error) console.error("Docker error:", event.error);
      };

      docker.modem.followProgress(stream, (err, output) => {
        clearTimeout(buildTimeout);
        if (err) return reject(err);
        resolve();
      }, onProgress);
    });
  });
};

const handleInspectImage = async (imageName, retries = 5, delay = 200) => {
  for (let i = 0; i < retries; i++) {
    try {
      const image = docker.getImage(imageName);
      return await image.inspect();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

export const buildImage = async (hostPath, id, imageName,folderHash) => {
  try {
    const tarStream = tar.pack(hostPath);
    await buildImageStream(tarStream, imageName);
    const data = await handleInspectImage(imageName);
    await Image.create({
      imageId : data.Id,
      repoTag : data.RepoTags[0],
      repoDigest : data.RepoDigests[0],
      createdAt : data.Created,
      size : data.Size,
      folderHash: folderHash,
    })
  } catch (error) {
    console.error("Error building Docker image:", error);
    throw error;
  } finally {
    try {
      await handleDeleteFolder(id);
    } catch (error) {
      console.log("CleanUp error : ", error);
    }
  }
};
