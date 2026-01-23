import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import Container from "../model/container.js";

const execAsync = util.promisify(exec);

const NGINX_PATH = `"C:\\nginx\\nginx.exe"`; //change it later //for docker there is another way

async function writeSiteConfig(domain, frontend = null, backend = null) {
  try {
    const config = nginxTemplate({ domain, frontend, backend });
    const filePath = path.join(
      process.cwd(),
      "nginxconfs/sites-enabled",
      `${domain}.conf`,
    );
    await fs.writeFile(filePath, config);

    // await reloadNginxSafe(); //uncomment it after integration
  } catch (error) {
    console.error(error);
  }
}

async function reloadNginxSafe() {
  try {
    await execAsync(`docker compose exec nginx nginx -t`);
    await execAsync(`docker compose exec nginx nginx -s reload`);
  } catch (err) {
    console.error("NGINX failed:", err.message);
  }
}

function nginxTemplate({ domain, frontend, backend }) {
  return `
server {
  listen 80;
  server_name ${domain};

  ${
    backend
      ? `
  # Backend API
  location /api/ {
    proxy_pass http://localhost:${backend};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  `
      : ""
  }

  ${
    frontend
      ? `
  # Frontend
  location / {
    proxy_pass http://localhost:${frontend};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  `
      : ""
  }
}
`;
}

async function getFrontendAndBackendPort(projectId) {
  const containers = await Container.find({
    project: projectId,
    type: { $in: ["frontend", "backend"] },
  }).select("+ports");

  // please don't wonder why there is [0] it is for future scaling(multiple ports from one container)
  const frontend =
    containers.find((c) => c.type === "frontend")?.ports[0].external || null;
  const backend =
    containers.find((c) => c.type === "backend")?.ports[0].external || null;

  return { frontend, backend };
}

export { writeSiteConfig, getFrontendAndBackendPort };
