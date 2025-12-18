import { Schema, model } from "mongoose";


const FolderSchema = new Schema({
    folderName : { //originalname
        type : String,
        required : true,
    },
    projectFolder: {
        type : String,
        required: true
    },
    destination : {
        type : String,
        required : true,
    },
    size : {
        type : Number,
        required : true
    },user : { //use it as userref
        type : String,
        required : true
    }
},{timestamps : true})

const Folder = model("folder",FolderSchema);

export default Folder;