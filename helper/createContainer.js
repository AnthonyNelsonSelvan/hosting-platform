import docker from "../connection/docker.js";
import path, { resolve } from "path";
import fs from "fs";

const createContainer = async (
  image,
  ports,
  volumes,
  aliases,
  network,
  basePath, //hostPath
  envVariables,
  updating = false
) => {
  const exposedPorts = {};
  const portBindings = {};
  const containerVolumes = [];
  const declaredVolumes = {};
  const containerNetwork = {};
  let restartPolicy;

  if (updating) {
    restartPolicy = { Name: "no" };
  } else {
    restartPolicy = { Name: "on-failure", MaximumRetryCount: 5 };
  }

  ports.forEach((p) => {
    exposedPorts[`${p.port}/${p.protocol}`] = {};
    portBindings[`${p.port}/${p.protocol}`] = [{ HostPort: "0" }];
  });

  let safeImageName = `${image.split(":")[0]}-${aliases}`;

  if (volumes) {
    volumes.forEach((vol) => {
      const hostPath = path.join(basePath, safeImageName, vol.name);
      if (vol.type === "folder") {
        if (!fs.existsSync(hostPath)) {
          fs.mkdirSync(hostPath, { recursive: true });
        }
      } else if (vol.type === "file") {
        const parentDir = path.dirname(hostPath);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        if (!fs.existsSync(hostPath)) {
          fs.appendFileSync(hostPath, "");
        }
      }
      containerVolumes.push(`${hostPath}:${vol.volume}`);
      declaredVolumes[vol.volume] = {};
    });
  }

  containerNetwork[network] = { Aliases: [aliases] };

  let container;

  try {
    container = await docker.createContainer({
      Image: image,
      Env: envVariables || [],
      Volumes: declaredVolumes,
      AttachStderr: true,
      AttachStdin: true,
      AttachStdout: true,
      ExposedPorts: exposedPorts,
      HostConfig: {
        RestartPolicy: restartPolicy,
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

    await new Promise((resolve) => setTimeout(resolve, 7000));

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
    return { containerDetails, portDetails };
  } catch (error) {
    if (container) {
      await container.remove();
    }
    throw error;
  }
};

export default createContainer;
