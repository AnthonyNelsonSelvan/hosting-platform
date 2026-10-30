# hosting-platform

A Docker-based hosting platform prototype built with Node.js and Dockerode. The project is designed to let users upload project archives, build Docker images, create isolated containers, attach internal databases, and manage per-project deployments from a backend service.

This repository is an early-stage internal platform for deploying app projects inside containers. It is intended to be integrated with a DNS/subdomain system such as `dnstitle` later to become a full hosting platform.

## Overview

The platform provides the following capabilities:

- upload a project archive (ZIP)
- extract and validate the uploaded project
- detect duplicate project folders/images
- build Docker images from uploaded source
- create Docker networks for project isolation
- create application containers with environment variables, ports, and volumes
- support internal database creation for supported DB engines
- manage container start/stop/delete operations
- generate NGINX config for frontend/backend routing
- track project/container metadata in MongoDB
- listen for Docker events and stream logs for deployed applications

## Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- Dockerode
- Docker Engine
- Multer
- unzipper
- tar-fs
- dotenv

## Architecture

```text
Client / API
   |
   v
Express Server
   |-- uploads project zip files
   |-- creates Docker images
   |-- creates project networks
   |-- spins up application containers
   |-- manages internal DB containers
   |-- stores metadata in MongoDB
   |
   +-- Docker Engine API (via dockerode)
   |
   +-- MongoDB (projects, images, containers, folders)
```

## Main Features

### Project upload and image build

The application accepts a ZIP upload, extracts it, hashes the folder contents, checks for duplicates, and builds a Docker image in the background.

### Container management

Users can:
- create containers from built images
- expose ports
- mount volumes
- pass environment variables
- link containers within a project network
- start/stop/delete containers

### Internal database support

Projects can optionally enable an internal DB with supported types:
- MongoDB
- PostgreSQL
- MySQL

The system creates a DB container, sets up internal networking, and injects connection variables into project containers.

### DNS / hosting integration readiness

The repo description explicitly mentions future integration with `dnstitle`, meaning this project is intended to evolve into a hosting platform with DNS-based project routing.

## Repo Structure

```text
.
├── backgroundFunc/
│   └── buildImage.js
├── connection/
│   ├── docker.js
│   └── mongo.js
├── controller/
│   ├── containerUpdate.js
│   ├── docker.js
│   ├── folder.js
│   └── project.js
├── helper/
│   ├── createContainer.js
│   ├── createDbContainer.js
│   ├── createNetwork.js
│   ├── deleteFolder.js
│   ├── deleteImage.js
│   ├── deleteNetwork.js
│   ├── demux.js
│   ├── dockerOperation.js
│   ├── hashFolder.js
│   ├── ignore.js
├── hydration/
│   ├── dockerEvents.js
│   └── hydrateErrLogStream.js
├── middleware/
│   ├── checkDuplicates.js
│   ├── errorHandler.js
│   └── updateValidity.js
├── model/
│   ├── container.js
│   ├── folder.js
│   ├── image.js
│   └── project.js
├── routes/
│   ├── docker.js
│   ├── folder.js
│   └── project.js
├── services/
│   ├── dockerode.services.js
│   ├── internalDbCreation.js
│   └── makeNginxConf.js
├── utils/
│   ├── logManager.js
│   ├── mergeEnv.js
│   ├── multer.js
│   └── unzipper.js
├── .gitignore
├── ToDos.txt
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Environment Variables

The project uses `.env` values for local runtime configuration.

Example:

```env
HOST_UPLOAD_ROOT=/var/lib/hosting-platform
MONGO_URI=mongodb://127.0.0.1:27017/hosting
``` 

Notes:
- `HOST_UPLOAD_ROOT` is used for uploaded project directories and project deployment paths.
- `MONGO_URI` is used to connect to MongoDB.
- Docker access is handled through the local Docker socket via `dockerode`.

## Installation

### 1) Clone the repository

```bash
git clone https://github.com/AnthonyNelsonSelvan/hosting-platform.git
cd hosting-platform
```

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment

Create a `.env` file in the project root:

```bash
HOST_UPLOAD_ROOT=/var/lib/hosting-platform
MONGO_URI=mongodb://127.0.0.1:27017/hosting
```

Make sure the host directory exists and is writable.

```bash
mkdir -p /var/lib/hosting-platform
```

### 4) Start the server

```bash
npm run dev
```

or:

```bash
npm start
```

The app runs on port `3000`.

## API Endpoints

### Docker routes

- `POST /api/docker/upload/:user/:project/:imageName`
  - upload a ZIP archive and build an image
- `POST /api/docker/create/container`
  - create a container from an image
- `DELETE /api/docker/delete/image/:imageId`
  - delete a Docker image
- `POST /api/docker/operations/:operation/:id`
  - control Docker container state (start/stop/restart/etc.)
- `GET /api/docker/get/envVariables/:containerId`
  - fetch environment variables for a container

### Project routes

- `POST /api/project/create/project`
  - create a project and optional database
- `DELETE /api/project/delete/project/:projectId`
  - delete a project and its resources

### Upload routes

- `/api/uploads/...`
  - used for upload-related functionality and folder management

## Key Backend Flow

### 1) Project upload

- file is uploaded via `multer`
- zip is extracted
- folder is stored in MongoDB
- duplicate detection prevents repeated builds
- a Docker image build is triggered in the background

### 2) Project creation

- project metadata is created
- Docker network is created or reused
- optional internal database is provisioned if requested
- project records are stored with network configuration and internal paths

### 3) Container creation

- selected image is used
- port mappings, volumes, aliases, and environment variables are passed to Docker
- if the container starts successfully, metadata is stored in MongoDB
- a generated NGINX config is prepared for routing

### 4) Runtime monitoring

- Docker event listeners are active
- log hydration listens to container logs
- runtime failures can be captured and tracked

## Docker Interaction

The project uses `dockerode` to talk directly to the Docker Engine. This allows it to:

- inspect containers
- create networks
- build images
- manage port publishing
- control running containers
- read logging output

## Database Support

Project metadata is stored in MongoDB, including:

- images
- folders
- containers
- projects
- database container details

This makes the platform stateful and allows the app to reconstruct deployment metadata after restart.

## Security and Operational Notes

This repository is a prototype and a platform backend, so a few considerations apply:

- Docker access is privileged and should only run in a trusted environment.
- uploaded project archives should be sanitized and validated
- authentication and authorization are not yet implemented at the application layer in the repo
- resource limits and security hardening should be added before production use
- project upload directories should be isolated per user

## Current State

This is best described as a self-hosted deployment engine / PaaS prototype rather than a fully production-ready hosting platform.

It is deliberately designed to be extended later into a full platform with:

- user accounts and authentication
- billing and quotas
- custom domains and subdomains
- reverse proxy automation
- SSL certificate management
- deployment pipelines and CI/CD hooks

## Future Goals

The README text from the repo description suggests the intended roadmap:

- integrate with a DNS system like `dnstitle`
- support custom domains for deployed applications
- build a complete hosting platform with user management and resource deployment
- eventually support real hosting for end users

## License

No explicit license file is present in the repository, so the project is currently unlicensed unless otherwise specified by the author.

## Contributing

This repository appears to be a personal prototype project. Contributions are possible if the repository owner chooses to accept them, but the project is not currently presented as a formal open-source contributor workflow.

## Repository

https://github.com/AnthonyNelsonSelvan/hosting-platform

---

If you want, I can also create a shorter, cleaner README specifically optimized for GitHub presentation, or a more advanced version with deployment architecture diagrams and API docs.
