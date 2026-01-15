import path from "path";
import unZipFiles from "../utils/unzipper.js";
import Folder from "../model/folder.js";
import { ignore } from "../helper/ignore.js";
import { buildImage } from "../services/dockerode.services.js";
import Container from "../model/container.js";
import createContainer from "../helper/createContainer.js";

const handleUpdateContainer = async (req, res) => {
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

  await unZipFiles(filePath, zipFileName, finalFolderName);

  const folder = await Folder.create({
    folderName: finalFolderName,
    projectFolder: project,
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

  const hostPath = path.join(req.project.folderPath, finalFolderName);

  const image = Container.findById(req.containerDoc._id).populate("image");
  const imageName = `${image.name}:v${image.version + 1}`;

  await buildImage(hostPath, folder._id, imageName, image.folderHash);

  const ports = [];
  req.containerDoc.ports.map((p) =>
    ports.push({ port: p.internal, protocol: p.protocol })
  );

  const volumes = isVolumeChanged ? newVolumes : req.containerDoc.volumes;
  const envVariables = isEnvChanged
    ? newEnvVariables
    : req.containerDoc.envVariables;

  const testContainerName = `${req.containerDoc.name}_testing`;

  const { containerDetails } = await createContainer(
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
};

export default handleUpdateContainer;
