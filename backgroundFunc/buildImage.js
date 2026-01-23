import { buildImage } from "../services/dockerode.services.js";

export async function buildImageBackground(
  hostPath,
  folderId,
  imageName,
  folderHash
) {
    //notify user with websocket if it failed or done building
  try {
    await buildImage(hostPath, folderId, imageName, folderHash);
  } catch (err) {
    console.error("Background image build failed:", err.message);
  } finally {
    try {
      await handleDeleteFolder(folderId);
    } catch {}
  }
}