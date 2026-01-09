import { Schema, model } from "mongoose";

const FolderSchema = new Schema(
  {
    folderName: {
      //originalname
      type: String,
      required: true,
    },
    projectFolder: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    user: {
      //use it as userref
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

FolderSchema.index(
  { folderName: 1, projectFolder: 1, user: 1 },
  { unique: true }
);

const Folder = model("Folder", FolderSchema);

export default Folder;
