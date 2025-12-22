import docker from "../connection/docker.js";
import path from "path";
import fs from "fs";

const createContainer = async (
  image,
  ports,
  volumes,
  aliases,
  network,
  baseUrl,
  containerName,
  envVariables
) => {
  const exposedPorts = {};
  const portBindings = {};
  const containerVolumes = [];
  const declaredVolumes = {};
  const containerNetwork = {};

  ports.forEach((p) => {
    exposedPorts[`${p.port}/${p.protocol}`] = {};
    portBindings[`${p.port}/${p.protocol}`] = [{ HostPort: "0" }];
  });

  const safeImageName = image.replace(/:/g, "-");

  if (volumes) {
    volumes.forEach((vol) => {
      const hostPath = path.join(baseUrl, safeImageName, vol.name);
      if (!fs.existsSync(hostPath)) {
        fs.mkdirSync(hostPath, { recursive: true });
      }
      containerVolumes.push(`${hostPath}:${vol.volume}`);
      declaredVolumes[vol.volume] = {};
    });
  }

  containerNetwork[network] = { Aliases: [aliases] };

  try {
    const container = await docker.createContainer({
      Image: image,
      name: containerName,
      Env: envVariables || [],
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
        Memory: 512 * 1024 * 1024,
        NanoCpus: 500000000,
        PortBindings: portBindings,
      },
      NetworkingConfig: {
        EndpointsConfig: containerNetwork,
      },
    });
    await container.start();
    const containerDetails = await container.inspect();

    const portDetails = []; // getting needed port details to save in db

    ports.forEach((port) => {
      let hostPort =
        containerDetails.NetworkSettings.Ports[
          `${port.port}/${port.protocol}`
        ][0].HostPort;
      let toPush = {
        internal: port.port,
        external: hostPort,
        protocol: port.protocol,
      };
      portDetails.push(toPush);
    });
    return { containerDetails, container, portDetails };
  } catch (error) {
    throw error;
  }
};
export default createContainer;
