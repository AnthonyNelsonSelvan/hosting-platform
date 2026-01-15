import path from "path";
import unZipFiles from "../utils/unzipper.js";
import Folder from "../model/folder.js";
import { ignore } from "../helper/ignore.js";
import { buildImage } from "../services/dockerode.services.js";
import Container from "../model/container.js";
import Image from "../model/image.js";
import createContainer from "../helper/createContainer.js";
import docker from "../connection/docker.js";
import dockerOperation from "../helper/dockerOperation.js";
import hashDirectory from "../helper/hashFolder.js";

const handleUpdateContainer = async (req, res) => {
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

  let draftContainer;
  try {
    await unZipFiles(filePath, zipFileName, finalFolderName);

    const folder = await Folder.create({
      folderName: finalFolderName,
      projectFolder: req.project.name, //here
      destination: filePath,
      size: req.file.size,
      user: user, //req.user
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

    //image building
    const hostPath = path.join(req.project.folderPath, finalFolderName);

    const container = await Container.findById(req.containerDoc._id).populate(
      "image"
    );
    const imageName = `${container.image.name}:v${container.image.version + 1}`;

    const image = await buildImage(hostPath, folder._id, imageName, folderHash);

    //making and running a test container
    const ports = [];
    container.ports.map((p) =>
      ports.push({ port: p.internal, protocol: p.protocol })
    );

    const volumes = isVolumeChanged ? newVolumes : container.volumes;
    const envVariables = isEnvChanged
      ? newEnvVariables
      : container.envVariables;

    const testContainerName = `${container.name}_testing`;

    const tempContainerDetails = await createContainer(
      imageName,
      ports,
      volumes,
      "testing",
      req.project.networkName,
      req.project.folderPath,
      testContainerName,
      envVariables,
      true
    );

    await docker.getContainer(tempContainerDetails.Id).remove({ force: true });

    if (!tempContainerDetails.State.Running) {
      return res
        .status(400)  
        .json({ message: "New Container failed the test." });
    }

    //stopping and deleting old containers
    await dockerOperation(container.containerId, "delete");

    //saving and creating the new container
    draftContainer = await Container.create({
      name: container.name,
      aliasesName: container.aliasesName,
      type: container.type,
      project: req.project._id,
      image: image._id,
      envVariables: envVariables || [],
      volumes: volumes || [],
      server: "Server A", //choose this from env later
    });

    const { containerDetails, portDetails } = await createContainer(
      imageName,
      ports,
      volumes,
      container.aliasesName,
      req.project.networkName,
      req.project.folderPath,
      container.name,
      envVariables
    );

    draftContainer.containerId = containerDetails.Id;
    draftContainer.ports = portDetails;
    await draftContainer.save();

    res.status(201).json({ message: "Container created successfully" });
  } catch (err) {
    if (draftContainer) {
      await Container.findByIdAndDelete(draftContainer._id);
    }
    console.log("Error creating container", err);
    res.status(500).json({ message: "Somethig went Wrong." });
  }
};

export default handleUpdateContainer;
