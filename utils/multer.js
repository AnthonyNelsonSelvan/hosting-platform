import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { user, project } = req.params;
        const uploadPath = path.join(process.cwd(), "uploads", user, project);


        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/zip" || file.mimetype === "application/x-zip-compressed") {
        cb(null, true)
    } else {
        cb(new Error("Only zip files are allowed."), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

export default upload;