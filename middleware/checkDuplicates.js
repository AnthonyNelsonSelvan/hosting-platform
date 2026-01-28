import Image from "../model/image.js";
import Project from "../model/project.js";

const checkDuplicateFolder = async (req, res, next) => {
  const { user, project, imageName } = req.params;
  const dockerInvalids = /[<>"/\\|?*\x00\x1F]/;
  if (
    dockerInvalids.test(imageName) ||
    /[A-Z]/.test(imageName) ||
    /\s/.test(imageName)
  ) {
    return res.status(400).json({ message: "Invalid Image Name." });
  }
  try {
    const isProjectThere = await Project.findOne({ name: project, user: user });
    if (!isProjectThere) {
      return res.status(400).json({ message: "Please make a project first." });
    }
    const isValid = await handleCheckDuplicateImage(imageName);
    if (isValid.valid === false) {
      return res.status(400).json({ message: isValid.message });
    }
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
  imageName = `${imageName}:v1`;
  return { valid: true, imageName: imageName};
};

export default checkDuplicateFolder;
