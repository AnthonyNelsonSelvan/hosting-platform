import { Router } from "express";
import { handleDeleteUploadsFolder } from "../controller/folder.js";

const router = Router();

router.delete("/delete/folder/:id",handleDeleteUploadsFolder);

export default router;