import Container from "../model/container.js";
import Project from "../model/project.js";

const checkUpdateValidity = async (req, res, next) => {
  const { _id, project } = req.params;
  const projectDoc = await Project.findOne({ name: project });
  if (!projectDoc) {
    return res.status(404).json({ message: "There is no such project." });
  }
  const containerDoc = await Container.findById(_id);
  if (!containerDoc) {
    return res
      .status(404)
      .json({ message: "There is no such container to update" });
  }
  req.project = projectDoc;
  req.containerDoc = containerDoc;
  next();
};

export default checkUpdateValidity;
