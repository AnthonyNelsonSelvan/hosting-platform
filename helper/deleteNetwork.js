import docker from "../connection/docker.js";

const deleteNetwork = async (networkId) => {
  try {
    const network = docker.getNetwork(networkId);
    await network.remove();
    return true;
  } catch (error) {
    if(error.statusCode === 404){
        return true;
    }
    console.error("Network delete skipped:", error)
    return false;
  }
};

export default deleteNetwork;
