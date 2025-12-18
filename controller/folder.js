import { handleDeleteFolder } from "../helper/deleteFolder.js"

const handleDeleteUploadsFolder = async (req, res) => {
    const id = req.params.id
    try {
        const deleted = await handleDeleteFolder(id)
        if (deleted.status === 404) {
            return res.status(404).json({ message: deleted.message })
        } else {
            res.status(200).json({ message: "successfully deleted" })
        }
    } catch (error) {
        console.log("Failed to delete folder", error)
        res.status(500).json({ message: "Failed to delete folder" })
    }
}

export { handleDeleteUploadsFolder };
