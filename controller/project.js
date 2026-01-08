import Project from "../model/project.js";
import path from "path";
import createInternalDBForProject from "../services/internalDbCreation.js";
import { createOrGetNetwork } from "../helper/createNetwork.js";
import docker from "../connection/docker.js";
import fs from "fs/promises";

const handleCreateProject = async (req, res) => {
  const {
    name,
    internalOrExternalDB,
    dbName,
    dbType,
    version,
    username,
    password,
  } = req.body;
  try {
    const isProjectThere = await Project.findOne({ name: name });

    if (isProjectThere) {
      return res.status(400).json({ message: "Project name taken." });
    }

    const projectDB = new Project({
      name: name,
      dbMode: internalOrExternalDB,
      folderPath: path.join(process.env.HOST_UPLOAD_ROOT, "nelson", name), //can update this later
      internalPath: path.join(process.cwd(), "uploads", "nelson", name), //i'll get user with req.user
    });

    const networkName = `host_net_${projectDB._id}`;

    const network = await createOrGetNetwork(networkName);

    projectDB.networkName = network;
    await projectDB.save();

    if (internalOrExternalDB === "internal") {
      const { containerDetails, hostPath, key, internalPathForDb } =
        await createInternalDBForProject(
          version,
          dbName,
          dbType,
          username,
          password,
          name,
          networkName
        );
      let protocol = "tcp";
      if (dbType === "mongo") protocol = "mongodb";
      if (dbType === "postgres") protocol = "postgresql";
      if (dbType === "mysql") protocol = "mysql";
      const internalPort = key.split("/")[0];
      const connectionString = `${protocol}://${username}:${password}@database:${internalPort}/${dbName}`;
      const rawName = containerDetails.Name;
      const cleanName = rawName.startsWith("/")
        ? rawName.substring(1)
        : rawName;
      projectDB.dbContainer = {
        containerName: cleanName,
        containerId: containerDetails.Id,
        engine: dbType,
        username: username,
        password: password,
        volumePathHost: hostPath,
        portOnHost: containerDetails.NetworkSettings.Ports[key][0].HostPort,
        networkUrl: connectionString,
        internalPath: internalPathForDb,
      };
      await projectDB.save();
    }

    return res.status(201).json({
      message: "Project created successfully",
      projectId: projectDB._id,
    });
  } catch (error) {
    console.error("Error while creating project", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

const handleDeleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "There is no such project please refresh and try again.",
      });
    }
    const containerId = project?.dbContainer?.containerId;
    if (containerId) {
      const dbContainer = docker.getContainer(containerId);
      const info = await dbContainer.inspect();
      if (info.State.Running) {
        await dbContainer.stop();
      }
      await dbContainer.remove();
      await fs.rm(path.normalize(project.dbContainer.internalPath), {
        recursive: true,
        force: true,
      });
    } else {
      await project.deleteOne();
    }
    res.status(200).json({ message: "Deleted the Project successfully." });
  } catch (error) {
    console.log("Error deleting project: ", error);
    res.status(500).json("Unexpected Error Happened");
  }
};

export { handleCreateProject, handleDeleteProject };
