import { Schema, model } from "mongoose";

const ContainerSchema = new Schema({
  // --- Identity ---
  containerId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  aliasesName: { type: String, required: true, trim: true },
  type: { type: String, enum: ["frontend", "backend", "database", "other"], required: true, default: "backend"},

  // --- Relationships ---
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  image: { type: Schema.Types.ObjectId, ref: "Image" },

  // --- Networking ---
  ports: [
    {
      internal: { type: String, required: true }, // e.g., 3000
      external: { type: String, required: true }, // e.g., 14005
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

  status: { type: String, default: "running" },
  createdAt: { type: Date, default: Date.now },
});

const Container = model("container", ContainerSchema);

export default Container;
