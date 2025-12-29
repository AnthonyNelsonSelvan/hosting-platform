import docker from "../connection/docker.js";
import Container from "../model/container.js";
import Project from "../model/project.js";
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

        const rawName = event.Actor.Attributes.name;

        const containerName = rawName.startsWith("/")
          ? rawName.substring(1)
          : rawName;

        switch (event.Action) {
          case "die":
            const inContainer = await Container.findOneAndUpdate(
              { name: containerName },
              { status: "stopped" }
            );
            if (!inContainer) {
              await Project.findOneAndUpdate(
                {
                  "dbContainer.containerName": containerName,
                },
                {
                  $set: { "dbContainer.status": "stopped" },
                }
              );
            }
            break;
          case "start":
            let appStarted = await Container.findOneAndUpdate(
              { name: containerName },
              { status: "running" },
              { new: true }
            );

            if (appStarted) {
              await appStarted.populate("project");

              if (appStarted.project) {
                const internalPath = path.normalize(
                  appStarted.project.internalPath
                );
                attachLogs(
                  appStarted.name,
                  internalPath,
                  appStarted.aliasesName
                );
              }
            } else {
              await Project.findOneAndUpdate(
                { "dbContainer.containerName": containerName },
                { $set: { "dbContainer.status": "running" } }
              );
            }
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
