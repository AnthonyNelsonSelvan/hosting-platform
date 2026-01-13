import Container from "../model/container.js";

const checkUpdateValidity = async (req, res, next) => {
  const { _id } = req.params;
  const containerDoc = await Container.findById(_id);
  if(!containerDoc){
    return res
          .status(404)
          .json({ message: "There is no such container to update" });
  }
  req.containerDoc = containerDoc;
  next();
};

export default checkUpdateValidity;
