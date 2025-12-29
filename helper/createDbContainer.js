import docker from "../connection/docker.js";
import path from "path";
import fs from "fs";     

const createDbContainer = async (
  image,
  ports,
  volume,
  network,
  envVars,
  project
) => {
  const exposedPorts = {};
  const portBindings = {};
  const containerVolumes = [];
  const declaredVolumes = {};
  const containerNetwork = {};
  const baseUrl = process.env.HOST_DB_ROOT;

  ports.forEach((p) => {
    exposedPorts[`${p.port}/${p.protocol}`] = {};
    portBindings[`${p.port}/${p.protocol}`] = [{ HostPort: "0" }];
  });

  const hostPath = path.join(baseUrl, project, volume.name);
  const internalPath = path.join(process.cwd(), "dbs", project, volume.name);
  if (!fs.existsSync(internalPath)) {
    //making a folder within the volumed folder of the container
    fs.mkdirSync(internalPath, { recursive: true });
  }
  containerVolumes.push(`${hostPath}:${volume.volume}`);
  declaredVolumes[volume.volume] = {};

  containerNetwork[network] = { Aliases: ["database"] };

  try {
    const container = await docker.createContainer({
      Image: image,
      Env: envVars,
      Volumes: declaredVolumes,
      AttachStderr: true,
      AttachStdin: true,
      AttachStdout: true,
      ExposedPorts: exposedPorts,
      HostConfig: {
        RestartPolicy: {
          Name: "on-failure",
          MaximumRetryCount: 5,
        },
        Binds: containerVolumes,
        PortBindings: portBindings,
        Memory: 512 * 1024 * 1024,
      },
      NetworkingConfig: {
        EndpointsConfig: containerNetwork,
      },
    });
    await container.start();
    const containerDetails = await container.inspect();
    return {containerDetails,hostPath}
  } catch (error) {
    console.error("Error Creating a project with a Database Container: ", error)
    throw error;
  }
};

export default createDbContainer;
