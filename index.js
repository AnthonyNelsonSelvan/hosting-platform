import 'dotenv/config'
import express, { urlencoded } from "express";

import connectMongoose from "./connection/mongo.js";
import dockerRouter from "./routes/docker.js";
import folderRoutes from "./routes/folder.js";
import listenToDockerEvents from "./hydration/dockerEvents.js";
import startListeningToLogs from "./hydration/hydrateErrLogStream.js";

connectMongoose("mongodb://127.0.0.1:27017/hosting");

const app = express();

app.use(urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/docker", dockerRouter);
app.use("/api/uploads", folderRoutes);

app.listen(3000, async () => {
  console.log("server started at port 3000");
  listenToDockerEvents();
  await startListeningToLogs();
});
