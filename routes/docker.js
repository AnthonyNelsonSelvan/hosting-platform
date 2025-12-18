import { Router } from "express";
import checkDuplicateFolder from "../middleware/checkDuplicates.js";
import { handleCreateContainer, handleDeleteImage, handleUploadAndBuildImage } from "../controller/docker.js";
import upload from "../utils/multer.js"

const router = Router();

router.post("/upload/:user/:project/:folder/:imageName", checkDuplicateFolder, upload.single("file"), handleUploadAndBuildImage);

router.post("/create/container",handleCreateContainer);

router.delete("/delete/image/:imageId",handleDeleteImage);

export default router;