import docker from "../connection/docker.js";
import Container from "../model/container.js";
import attachLogs from "../utils/logManager.js";
import path from "path";

const listenToDockerEvents = async () => {
  try {
    const stream = await docker.getEvents();

    stream.on("data", async (chunk) => {
      try {
        const event = JSON.parse(chunk.toString());

        if (!event) return;

        if (event.Type !== "container") return;

        const containerName = event.Actor.Attributes.name;

        switch (event.Action) {
          case "die":
            await Container.findOneAndUpdate(
              { name: containerName },
              { status: "stopped" }
            );
            break;
          case "start":
            const container = await Container.findOneAndUpdate(
              { name: containerName },
              { status: "running" },
              { new: true }
            ).populate("project");

            const internalPath = path.normalize(container.project.internalPath);

            attachLogs(container.name, internalPath, container.aliasesName);
            break;
          case "destroy":
            await Container.findOneAndDelete({ name: containerName });
            break;
        }
      } catch (error) {
        console.error("Error inside docker event stream: ", error);
      }
    });
  } catch (error) {
    console.error("Error Processing Docker Event: ", error);
  }
};

export default listenToDockerEvents;
