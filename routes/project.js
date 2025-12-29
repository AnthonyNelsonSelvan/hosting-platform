import { Router } from "express";
import { handleCreateProject } from "../controller/project.js";

const router = Router();

router.post("/create/project", handleCreateProject);

export default router;