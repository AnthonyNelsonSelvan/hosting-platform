import { Router } from "express";
import {
  handleCreateProject,
  handleDeleteProject,
} from "../controller/project.js";

const router = Router();

router.post("/create/project", handleCreateProject);

router.delete("/delete/project/:projectId", handleDeleteProject);

export default router;
