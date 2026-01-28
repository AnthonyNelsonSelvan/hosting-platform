import { Router } from "express";
import checkDuplicateFolder from "../middleware/checkDuplicates.js";
import {
  handleCreateContainer,
  handleDeleteImage,
  handleDockerOperations,
  handleUploadAndBuildImage,
} from "../controller/docker.js";
import upload from "../utils/multer.js";
import {
  handleUpdateContainer,
  handleGetEnv,
} from "../controller/containerUpdate.js";
import checkUpdateValidity from "../middleware/updateValidity.js";

const router = Router();

router.post(
  "/upload/:user/:project/:imageName",
  checkDuplicateFolder,
  upload.single("file"),
  handleUploadAndBuildImage,
);

router.post("/create/container", handleCreateContainer);

router.delete("/delete/image/:imageId", handleDeleteImage);

router.post("/operations/:operation/:id", handleDockerOperations);

router.post(
  "/update/container/:user/:project/:_id",
  checkUpdateValidity,
  upload.single("file"),
  handleUpdateContainer,
);

router.get("/get/envVariables/:containerId", handleGetEnv);

export default router;
