import Docker from "dockerode";
import os from "os"

const docker = new Docker({
    socketPath: os.platform() === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock"
});

export default docker;