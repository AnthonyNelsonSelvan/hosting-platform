import createContainer from "../helper/createContainer";

const createInternalDBForProject = (
  version,
  dbName,
  dbType,
  user,
  password,
  hostDbPath,
  networkName
) => {
  let image, envVars, containerVolPath;
  switch (dbType) {
    case "postgres":
      image = `postgres:${version}`;
      containerVolPath = "/var/lib/postgresql/data";
      envVars = [
        `POSTGRES_USER=${user}`,
        `POSTGRES_PASSWORD=${password}`,
        `POSTGRES_DB=${dbName}`,
      ];
    //   const volumes = [hostPath: ]
      ports = [
        {
          port: 3306,
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
      ports = [
        {
          port: 5432,
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
      ports = [
        {
          port: 27017,
          protocol: "tcp",
        },
      ];
      break;

    default:
      throw new Error(`Unsupported Database Type: ${dbType}`);
  }

  createContainer(image,ports,);
};
