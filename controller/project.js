import Project from "../model/project.js";
import path from "path";

const handleCreateProject = async (req, res) => {
  const { user, name, internalOrExternalDB } = req.body;
  try {
    const isProjectThere = await Project.findOne({ name: name });

    if (isProjectThere) {
      return res.status(400).json({ message: "Project name taken." });
    }

    if (internalOrExternalDB === "internal") {
      //make the db if internal keep it ready to connect to their backend
    }

    const projectDB = new Project({
      name: name,
      dbType: internalOrExternalDB,
      folderPath: path.join(process.env.HOST_UPLOAD_ROOT, user, name), //can update this later
      internalPath: path.join(process.cwd(), "uploads", user, name),
    });

    const networkName = `host_net_${projectDB._id}`;

    const network = await createOrGetNetwork(networkName);

    projectDB.networkName = network;
    await projectDB.save();
    return res.status(201).json({
      message: "Project created successfully",
      projectId: projectDB._id,
    });
  } catch (error) {
    console.error("Error while creating project");
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export { handleCreateProject };
