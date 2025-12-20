import docker from "../connection/docker.js";
import Container from "../model/container.js";

const listenToDockerEvents = async () => {
  try {
    const stream = await docker.getEvents();

    stream.on("data", async (chunk) => {
      try {
        const event = JSON.parse(chunk.toString());

        if (!event) return;

        if (event.Type !== "container") return;

        const containerId = event.Actor.ID;

        switch (event.Action) {
          case "die":
            await Container.findOneAndUpdate(
              { containerId: containerId },
              { status: "stopped" }
            );
            break;
          case "start":
            await Container.findOneAndUpdate(
              { containerId: containerId },
              { status: "running" }
            );
            break;
          case "destroy":
            await Container.findOneAndDelete({ containerId: containerId });
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
