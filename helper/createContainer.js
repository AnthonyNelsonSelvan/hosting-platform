import docker from "../connection/docker.js";

const createContainer = async (
  image,
  ports,
  volumes,
  aliases,
  network,
  baseUrl,
  containerName
) => {
  const exposedPorts = {};
  const portBindings = {};
  const containerVolumes = [];
  const containerNetwork = {};

  ports.forEach((p) => {
    exposedPorts[`${p.port}/${p.protocol}`] = {};
    portBindings[`${p.port}/${p.protocol}`] = [{ HostPort: "0" }];
  });

  const safeImageName = image.replace(/:/g, "-");

  if (volumes) {
    volumes.forEach((vol) => {
      containerVolumes.push(
        `${baseUrl}/${safeImageName}/${vol.name}:${vol.volume}`
      );
    });
  }

  containerNetwork[network] = { Aliases: [aliases] };

  try {
    const container = await docker.createContainer({
      Image: image,
      name: containerName,
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
    return containerDetails;
  } catch (error) {
    throw error;
  }
};
export default createContainer;
