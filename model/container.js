import mongoose, { Schema, model } from "mongoose";

const ContainerSchema = new Schema(
  {
    containerId: { type: String, unique: true, sparse: true },
    name: { type: String },
    aliasesName: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["frontend", "backend", "other"],
      required: true,
      default: "backend",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    // user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
    ports: {
      type: [
        {
          internal: { type: String, required: true, default: "pending" },
          external: { type: String, required: true, default: "pending" },
          protocol: { type: String, default: "tcp" },
        },
      ],
      select: false,
    },
    envVariables: {
      type: [String],
      select: false,
    },
    volumes: [
      {
        name: String,
        volume: String,
        type: {
          type: String,
          enum: ["file", "folder"],
        },
      },
    ],
    memoryLimit: {
      type: Number,
      default: 512 * 1024 * 1024, // 512MB
    },
    restartPolicy: {
      type: String,
      enum: ["no", "always", "on-failure", "unless-stopped"],
      default: "on-failure",
    },
    server: {
      type: String,
      required: true,
    },

    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Container = model("Container", ContainerSchema);

export default Container;
