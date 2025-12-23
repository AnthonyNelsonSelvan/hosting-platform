import mongoose, { Schema, model } from "mongoose";

const ContainerSchema = new Schema(
  {
    containerId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    aliasesName: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["frontend", "backend", "database", "other"],
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
    ports: [
      {
        internal: { type: String, required: true, default: "pending" }, 
        external: { type: String, required: true, default: "pending" },
        protocol: { type: String, default: "tcp" },
      },
    ],
    envVariables: [{ key: String, value: String }],
    volumes: [{ name: String, volume: String }],
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
  { timestamps: true }
);

const Container = model("Container", ContainerSchema);

export default Container;
