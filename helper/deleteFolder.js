import Folder from "../model/folder.js";
import fs from "fs"
import path from "path";


const handleDeleteFolder = async (id) => {
    try {
        const folder = await Folder.findById(id);
        if (!folder) {
            return { status: 404, message: "No folder Found please refresh the page." }
        }
        await fs.promises.rm(path.join(folder.destination, folder.folderName), { recursive: true, force: true });
        await folder.deleteOne();
        return { status: 200 }
    } catch (error) {
        console.log("Folder Deleting error",error)
    }
}

export {handleDeleteFolder};