import docker from "../connection/docker.js";
import Container from "../model/container.js";

const dockerOperation = async (id, operation) => {
  try {
    const doc = await Container.findOne({ containerId: id });
    if (!doc) {
      return {
        status: 404,
        message: "Please refresh the page the container is not available.",
      };
    }
    const container = docker.getContainer(id);
    const info = await container.inspect();
    switch (operation) {
      case "start":
        if (info.State.Running) {
          return { status: 400, message: "The Container is already running." };
        }
        await container.start();
        break;
      case "stop":
        if (!info.State.Running) {
          return {
            status: 400,
            message: "The Container is already not running.",
          };
        }
        await container.stop();
        break;
      case "restart":
        await container.restart();
        break;
      case "delete":
        if (info.State.Running) {
          await container.stop();
        }
        await container.remove();
        break;
    }
    return { status: 200, message: `Container ${operation}ed sucessfully.` };
  } catch (error) {
    throw error;
  }
};

export default dockerOperation;
