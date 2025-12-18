import {Schema,model} from "mongoose";

const ImageSchema = new Schema({
  imageId: {              // Docker Image ID (sha256)
    type: String,
    required: true,
    unique: true
  },

  repoTag: {              // Example: "myapp:latest"
    type: String,
    required: true,
    unique: true
  },

  repoDigest: {           // Example: "myapp@sha256:..."
    type: String,
    required: true,
    unique: true
  },

  createdAt: {      // When Docker says the image was created
    type: Date,
    required: true
  },

  size: {                 // Size in bytes
    type: Number,
    required: true
  },
  folderHash: {
    type: String,
    required: true,
    unique: true,
  },
//   owner: {                // Owner of the image (user ID)
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   }

}, { timestamps: true }); // gives createdAt, updatedAt automatically

const Image = model("Image", ImageSchema);

export default Image;