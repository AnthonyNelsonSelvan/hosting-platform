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
      unique: true, //for volumes 
    },
    dbType: {
      type: String,
      required: true,
      enum: ["internal","external","none"],
    },
    internalPath: {
      type: String,
      unique: true
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
