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
    dbMode: {
      type: String,
      required: true,
      enum: ["internal", "external", "none"],
    },
    internalPath: {
      type: String,
      unique: true,
    },
    user: {
      type: String,
      required: true,
    },
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
    dbContainer: {
      containerName: {
        type: String,
      },
      containerId: {
        type: String,
      },
      engine: {
        type: String,
        enum: ["mongo", "postgres", "mysql"],
      },
      username: {
        type: String,
      },
      password: {
        type: String,
        select: false,
      },
      volumePathHost: {
        type: String,
      },
      portOnHost: {
        type: String,
      },
      status: {
        type: String,
      },
      networkUrl: {
        type: String,
        select: false,
      },
      internalPath: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Project = model("Project", ProjectSchema);

export default Project;
