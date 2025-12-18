import Folder from "../model/folder.js";
import Image from "../model/image.js";


const checkDuplicateFolder = async (req, res, next) => {
    const { user, project, folder, imageName } = req.params;
    const invalids = /[<>:"/\\|?*.\x00-\x1F]/;
    const dockerInvalids = /[<>"/\\|?*\x00\x1F]/;
    if (invalids.test(project) || invalids.test(user) || invalids.test(folder)) {
        return res.status(400).json({ message: "You have added invalid symbols." })
    }
    if (dockerInvalids.test(imageName) || (/[A-Z]/).test(imageName) || (/\s/).test(imageName)) {
        return res.status(400).json({ message: "Invalid Image Name." })
    }
    try {
        const isValid = await handleCheckDuplicateImage(imageName);
        if(isValid.valid === false){
            return res.status(400).json({message: isValid.message});
        }
        const existingFolder = await Folder.findOne({ folderName: folder, projectFolder: project, user: user })
        if (existingFolder) {
            return res.status(409).json({ message: "Folder name already exist." });
        }
        next()
    } catch (error) {
        console.log("Error in Folder duplicate middleware :", error);
        res.status(500).json({ message: "Something went wrong." })
    }
}

const handleCheckDuplicateImage = async (imageName) => {
    const splitImage = imageName.split(":");
    if (splitImage.length > 2) {
        return { valid: false, message: "Only one colon allowed in Image name." }
    }
    if (splitImage.length === 2) {
        if (!splitImage[1]) {
            return { valid: false, message: "Invalid Image Name" };
        }
    }
    if (splitImage.length === 1) {
        imageName = `${imageName}:latest`
    }
    const valid = await Image.findOne({
        repoTag: imageName
    })
    if(valid){
        return {valid: false, message: "Image name is taken."}
    }
    return {valid : true}
}

export default checkDuplicateFolder;    