import Folder from "../model/folder.js";
import Image from "../model/image.js";

const checkDuplicateFolder = async (req, res, next) => {
  const { user, project, folder, imageName } = req.params;
  const invalids = /[<>:"/\\|?*.\x00-\x1F]/;
  const dockerInvalids = /[<>"/\\|?*\x00\x1F]/;
  if (invalids.test(project) || invalids.test(user) || invalids.test(folder)) {
    return res.status(400).json({ message: "You have added invalid symbols." });
  }
  if (
    dockerInvalids.test(imageName) ||
    /[A-Z]/.test(imageName) ||
    /\s/.test(imageName)
  ) {
    return res.status(400).json({ message: "Invalid Image Name." });
  }
  try {
    const isValid = await handleCheckDuplicateImage(imageName);
    if (isValid.valid === false) {
      return res.status(400).json({ message: isValid.message });
    }
    const existingFolder = await Folder.findOne({
      folderName: folder,
      projectFolder: project,
      user: user,
    });
    if (existingFolder) {
      return res.status(409).json({ message: "Folder name already exist." });
    }
    req.baseName = isValid.baseName;
    req.params.imageName = isValid.imageName;
    next();
  } catch (error) {
    console.log("Error in Folder duplicate middleware :", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

const handleCheckDuplicateImage = async (imageName) => {
  imageName = imageName.trim();

  if (imageName.includes(":")) {
    return {
      valid: false,
      message: "Do not include version. Only provide image name.",
    };
  }

  const exist = await Image.findOne({
    name: imageName,
  });

  if (exist) {
    return { valid: false, message: "Image name is taken." };
  }
  const baseName = imageName;
  imageName = `${imageName}:v1`;
  return { valid: true, imageName: imageName, baseName: baseName };
};

export default checkDuplicateFolder;
