import docker from "../connection/docker.js";

const createOrGetNetwork = async (network) => {
  try {
    await docker.createNetwork({
      Name: network,
      Driver: "bridge",
    });
    return network;
  } catch {
    return error;
  }
};

export { createOrGetNetwork };
