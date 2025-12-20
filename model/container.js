import mongoose, { Schema, model } from "mongoose";

const ContainerSchema = new Schema({
  // --- Identity ---
  containerId: { type: String, unique: true,sparse: true },
  name: { type: String, required: true },
  aliasesName: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ["frontend", "backend", "database", "other"],
    required: true,
    default: "backend",
  },

  // --- Relationships ---
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },

  // --- Networking ---
  ports: [
    {
      internal: { type: String, required: true, default: "pending" }, // e.g., 3000
      external: { type: String, required: true, default: "pending" }, // e.g., 14005
      protocol: { type: String, default: "tcp" }, // tcp or udp
    },
  ],

  // --- Configuration ---
  envVariables: [{ key: { type: String }, value: { type: String } }],
  volumes: [{ hostPath: String, containerPath: String }],

  // --- 🛡️ Limits & Safety ---
  memoryLimit: {
    type: Number,
    default: 512 * 1024 * 1024, // 512MB
  },
  restartPolicy: {
    type: String,
    enum: ["no", "always", "on-failure", "unless-stopped"],
    default: "on-failure",
  },

  //says on which server the container is running if failed
  server: {
    type: String,
    required: true,
  },

  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const Container = model("Container", ContainerSchema);

export default Container;
