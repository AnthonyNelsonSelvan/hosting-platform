import mongoose, { model, Schema } from "mongoose";

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    networkName: {
      type: String,
      required: true,
      unique: true,
    },
    folderPath: {
      type: String,
      required: true,
      unique: true, //for volumes 
    }
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
  },
  { timestamps: true }
);

const Project = model("Project", ProjectSchema);

export default Project;
