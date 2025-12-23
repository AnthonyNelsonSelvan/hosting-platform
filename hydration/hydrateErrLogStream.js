import docker from "../connection/docker.js";
import Container from "../model/container.js";
import attachLogs from "../utils/logManager.js";

const startListeningToLogs = async () => {
  console.log("Hydration: Checking for active containers...");

  let container;
  let containers = [];
  try {
    containers = await Container.find({
      status: "running",
      server: "Server A",
    }).populate("project");
  } catch (err) {
    console.error("Critical DB Error during hydration:", err);
    return;
  }
  try {
    for (container of containers) {
      try {
        const dockerContainer = docker.getContainer(container.containerId);

        let inspectData;
        try {
          inspectData = await dockerContainer.inspect();
        } catch (error) {
          if (error.statusCode === 404) {
            container.status = "terminated"; // delete all the terminated with cron Job later;
            await container.save();
            continue;
          }
          throw error;
        }
        if (!inspectData.State.Running) { //checks if still running
          container.status = "stopped";
          await container.save();
          continue;
        }
        const internalPath = container.project.internalPath;
        attachLogs(container.name, internalPath, container.aliasesName); //fire and forget
      } catch (error) {
        console.error(`Error syncing ${container.name}:`, error);
      }
    }
    console.log("Hydration & Sync Complete.");
  } catch (error) {
    console.error(`Error attaching log of ${container.name}: `, error);
  }
};

export default startListeningToLogs;
