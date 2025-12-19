import path from "path";
import unZipFiles from "../utils/unzipper.js";
import Folder from "../model/folder.js";
import { buildImage } from "../services/dockerode.services.js";
import hashDirectory from "../helper/hashFolder.js";
import { ignore } from "../helper/ignore.js";
import Image from "../model/image.js";
import deleteImage from "../helper/deleteImage.js";
import { handleDeleteFolder } from "../helper/deleteFolder.js";
import { createOrGetNetwork } from "../helper/createNetwork.js";
import Project from "../model/project.js";
import createContainer from "../helper/createContainer.js";

const handleUploadAndBuildImage = async (req, res) => {
  {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or invalid file type." });
    }
    const filePath = path.dirname(req.file.path);
    const zipFileName = req.file.filename;
    const finalFolderName = req.params.folder;
    const { project, user, imageName } = req.params;
    try {
      console.log(filePath);
      await unZipFiles(filePath, zipFileName, finalFolderName);
      const folder = await Folder.create({
        folderName: finalFolderName,
        projectFolder: project,
        destination: filePath,
        size: req.file.size,
        user: user, //for ref
      });

      const finalFilePath = path.join(filePath, finalFolderName);

      const folderHash = hashDirectory(finalFilePath, ignore);

      const isDuplicate = await Image.findOne({ folderHash: folderHash });

      if (isDuplicate) {
        handleDeleteFolder(folder._id);
        return res.status(409).json({
          message: `This folder has been already created as image use ${isDuplicate.repoTag}.`,
        });
      }

      const isProjectThere = await Project.findOne({ folderPath: filePath });

      if (!isProjectThere) {
        const projectDB = new Project({
          name: project,
          folderPath: filePath,
        });

        const networkName = `host_net_${projectDB._id}`;

        const network = await createOrGetNetwork(networkName);

        projectDB.networkName = network;
        await projectDB.save();
      }

      buildImage(finalFilePath, folder._id, imageName, folderHash);
      res.status(201).send("File uploaded & extracted Successfully!");
    } catch (err) {
      console.log("Unzip failed", err);
      res.status(500).send("Failed To extract zip.");
    }
  }
};

const handleCreateContainer = async (req, res) => {
  try {
    const { image, ports, volumes, aliases, containerName, netName } = req.body;
    console.log(ports);
    const exist = await Image.findOne({ repoTag: image });
    if (!exist) {
      return res
        .status(404)
        .json({ message: `There is no image named ${image}` });
    }

    const net = await Project.findOne({ name: netName });

    if (!net) {
      return res
        .status(404)
        .json({ message: `No Network found named ${netName}` });
    }

    const baseUrl = path.normalize(net.folderPath);
    const network = net.networkName;

    const aboutContainer = await createContainer(
      exist.repoTag,
      ports,
      volumes,
      aliases,
      network,
      baseUrl,
      containerName
    );
    console.log(aboutContainer.NetworkSettings.Ports["8000/tcp"][0].HostPort);
    console.log(aboutContainer.NetworkSettings.Ports["8000/tcp"][0].HostIp);
    const logStream = await aboutContainer.logs({
      follow: true,
      stdout: true,
      stderr: true,
    });

    let errorCount = 0;
    let maxErrorCount = 50;

    const resetTimer = setInterval(() => {
      errorCount = 0;
    }, 6000000);

    const errorLogStream = fs.createWriteStream(
      path.join(baseUrl, "error_logs.txt"),
      { flags: "a" }
    );

    logStream.on("data", (chunk) => {
      const type = chunk[0];
      if (type !== 2) return;

      if (errorCount > maxErrorCount) return;

      errorCount++;

      const errorMsg = chunk.slice(8).toString("utf8");
      errorLogStream.write(errorMsg);
      console.log(logLine); //TODO:Websocket
    });

    logStream.on('end', () => {
      clearInterval(resetTimer);
    });

    res.status(201).json({ message: "Container created successfully" });
  } catch (error) {
    console.log("Error creating container", error);
    res.status(500).json({ message: "Somethig went Wrong." });
  }
};

async function handleDeleteImage(req, res) {
  try {
    const imageId = req.params.imageId;
    const response = await deleteImage(imageId);
    if (response.status !== 200) {
      return res.status(response.status).json({ message: response.message });
    }
    return res.status(200).json({ message: "Image deleted Successfully" });
  } catch (error) {
    console.log("Image deletion Failed :", error);
    return res.status(500).json("Something went wrong");
  }
}

export { handleUploadAndBuildImage, handleCreateContainer, handleDeleteImage };
