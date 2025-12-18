import docker from "../connection/docker.js";
import Image from "../model/image.js";


async function deleteImage(id){
    try {
        const imageExists = await Image.findOne({imageId : id});
        if(!imageExists){
            return {status: 404, message: "Image not Found to delete"}
        }
        const image = docker.getImage(id);
        await image.remove()
        await imageExists.deleteOne();
        return {status: 200};
    } catch (error) {
        console.log("Error Deleting image : ",error);
    }
}

export default deleteImage;