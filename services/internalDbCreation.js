const createInternalDBForProject = async (
  version,
  dbName,
  dbType,
  user,
  password,
  project
) => {
  let image, envVars, containerVolPath, volume, ports;
  switch (dbType) {
    case "postgres":
      image = `postgres:${version}`;
      containerVolPath = "/var/lib/postgresql/data";
      envVars = [
        `POSTGRES_USER=${user}`,
        `POSTGRES_PASSWORD=${password}`,
        `POSTGRES_DB=${dbName}`,
      ];
      volume = { name: project, volume: containerVolPath };
      ports = [
        {
          port: 5432,
          protocol: "tcp",
        },
      ];
      break;

    case "mysql":
      image = `mysql:${version}`;
      containerVolPath = "/var/lib/mysql";
      envVars = [
        `MYSQL_USER=${user}`,
        `MYSQL_PASSWORD=${password}`,
        `MYSQL_DATABASE=${dbName}`,
        `MYSQL_ROOT_PASSWORD=${password}`,
      ];
      volume = { name: project, volume: containerVolPath };
      ports = [
        {
          port: 3306,
          protocol: "tcp",
        },
      ];
      break;

    case "mongo":
      image = `mongo:${version}`;
      containerVolPath = "/data/db";
      envVars = [
        `MONGO_INITDB_ROOT_USERNAME=${user}`,
        `MONGO_INITDB_ROOT_PASSWORD=${password}`,
      ];
      volume = { name: project, volume: containerVolPath };
      ports = [
        {
          port: 27017,
          protocol: "tcp",
        },
      ];
      break;

    default:
      const err = new Error("DB unsupported.");
      err.statusCode = 400;
      throw err;
  }

  const key = `${ports[0].port}/${ports[0].protocol}`;
  return { key, image, ports, volume, envVars, project };
};

export default createInternalDBForProject;
