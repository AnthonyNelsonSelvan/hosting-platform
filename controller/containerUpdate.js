import path from "path";
import unZipFiles from "../utils/unzipper.js";
import Folder from "../model/folder.js";
import { ignore } from "../helper/ignore.js";
import { buildImage } from "../services/dockerode.services.js";
import Container from "../model/container.js";
import Image from "../model/image.js";
import createContainer from "../helper/createContainer.js";
import docker from "../connection/docker.js";
import hashDirectory from "../helper/hashFolder.js";
import { handleDeleteFolder } from "../helper/deleteFolder.js";
import deleteImage from "../helper/deleteImage.js";
import {
  getFrontendAndBackendPort,
  writeSiteConfig,
} from "../services/makeNginxConf.js";
import fs from "fs/promises";
import attachLogs from "../utils/logManager.js";

const handleUpdateContainer = async (req, res) => {
  //can improve here
  //upload and unzip
  const { isVolumeChanged, newVolumes, isEnvChanged, newEnvVariables } =
    req.body;
  const { user } = req.params;
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file uploaded or invalid file type." });
  }

  const filePath = path.dirname(req.file.path);
  const zipFileName = req.file.filename;
  const finalFolderName = String(Date.now());

  let folder;
  let image;
  try {
    await unZipFiles(filePath, zipFileName, finalFolderName);

    folder = await Folder.create({
      folderName: finalFolderName,
      projectFolder: req.project.name, //here
      destination: filePath,
      size: req.file.size,
      user: user, //req.user
    });
    const finalFilePath = path.join(filePath, finalFolderName);
    const folderHash = await hashDirectory(finalFilePath, ignore);
    const isDuplicate = await Image.findOne({ folderHash: folderHash });

    if (isDuplicate) {
      await handleDeleteFolder(folder._id);
      return res.status(409).json({
        message: `This folder has been already created as image use ${isDuplicate.repoTag}.`,
      });
    }

    if (isEnvChanged) {
      const blocked = ["PATH", "HOME", "NODE_OPTIONS"];
      if (newEnvVariables) {
        for (let env of newEnvVariables) {
          if (!env.includes("=")) {
            await handleDeleteFolder(folder._id);
            return res
              .status(400)
              .json({ message: `Found an invalid env ${env}` });
          }
          const [key, value] = env.split("=");
          if (blocked.includes(key)) {
            await handleDeleteFolder(folder._id);
            return res
              .status(400)
              .json({ message: `Env ${key} is not allowed` });
          }
          if (!key || value === undefined) {
            await handleDeleteFolder(folder._id);
            return res
              .status(400)
              .json({ message: `Found an invalid env ${env}` });
          }
        }
      }
    }

    //image building
    const hostPath = path.join(req.project.folderPath, finalFolderName);

    const container = await Container.findById(req.containerDoc._id)
      .populate("image")
      .select("+ports")
      .select("+envVariables");
    const imageName = `${container.image.name}:v${container.image.version + 1}`;

    image = await buildImage(hostPath, folder._id, imageName, folderHash);

    //preparing variables
    const ports = [];
    container.ports.map((p) =>
      ports.push({ port: p.internal, protocol: p.protocol }),
    );

    const volumes = !isVolumeChanged ? container.volumes : newVolumes;
    const envVariables = !isEnvChanged
      ? container.envVariables
      : newEnvVariables;

    //pending from here (swapping old container with new one)
    const { containerDetails, portDetails } = await createContainer(
      imageName,
      ports,
      volumes,
      container.aliasesName,
      req.project.networkName,
      req.project.folderPath,
      envVariables,
      true,
    );

    if (!containerDetails.State.Running) {
      await docker.getContainer(containerDetails.Id).remove({ force: true });
      return res.status(400).json({ message: "Container failed to start" });
    }

    const newContainer = await docker.getContainer(containerDetails.Id);
    const oldContainer = await docker.getContainer(container.containerId);
    const oldContainerName = container.name;

    await newContainer.update({
      RestartPolicy: { Name: "on-failure", MaximumRetryCount: 5 },
    });

    container.containerId = containerDetails.Id;
    container.name = containerDetails.Name.slice(1);
    container.envVariables = envVariables;
    container.volumes = volumes;
    container.image = image._id;
    container.ports = portDetails;

    await container.save();

    if (container.type === "frontend" || container.type === "backend") {
      const { frontend, backend } = await getFrontendAndBackendPort(
        req.project._id,
      );

      await writeSiteConfig("localhost", frontend, backend);
    }

    try {
      await oldContainer.stop();
      await oldContainer.remove();
    } catch (error) {
      console.error("old Container cleanup failed: ", error.message);
    }

    try {
      await fs.unlink(
        path.join(
          req.project.internalPath,
          `${oldContainerName}_error_logs.txt`,
        ),
      );
    } catch (err) {
      console.log("Failed to delete the log file", err);
    }

    await attachLogs(
      container.name,
      req.project.internalPath,
      container.aliasesName,
    );
    res.status(201).json({ message: "Container Updated successfully" });
  } catch (err) {
    try {
      await handleDeleteFolder(folder._id);
      if (image?.imageId) await deleteImage(image.imageId);
    } catch {}
    console.log("Error creating container", err);
    res.status(500).json({ message: "Somethig went Wrong." });
  }
};

export default handleUpdateContainer;
