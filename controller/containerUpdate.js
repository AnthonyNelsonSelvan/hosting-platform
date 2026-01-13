import path from "path";
import unZipFiles from "../utils/unzipper.js";
import Folder from "../model/folder.js";
import { ignore } from "../helper/ignore.js";

const handleUpdateContainer = async (req, res) => {
  const { isVolumeChanged, volumes, isEnvChanged, envVariables } = req.body;
  const { user, project } = req.params;
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
};

export default handleUpdateContainer;
