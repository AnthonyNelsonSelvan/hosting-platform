import docker from "../connection/docker.js";
import Container from "../model/container.js";
import Image from "../model/image.js";


async function deleteImage(id){
    try {
        const imageExists = await Image.findOne({imageId : id});
        if(!imageExists){
            return {status: 404, message: "Image not Found to delete"}
        }
        const containerUsing = await Container.findOne({image: imageExists._id});
        if(containerUsing){
            return {status: 400, message: "Can not delete image, There are container using this image."}
        }
        const image = docker.getImage(id);
        await image.remove({force: true});
        await imageExists.deleteOne();
        return {status: 200};
    } catch (error) {
        console.log("Error Deleting image : ",error);
    }
}

export default deleteImage;