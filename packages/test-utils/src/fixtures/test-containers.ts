import { ITestContainerOptions } from '../testcontainers';

export const tcUsername = 'root';
export const tcPassword = '123456';
export const tcDatabaseName = 'test_db';
export const tcName = 'tresdoce-test-container';

/* Test Containers - Redis options */
export const TCRedisOptions: ITestContainerOptions = {
  ports: [
    {
      container: 6379,
      host: 6379,
    },
  ],
  envs: {
    REDIS_USERNAME: tcUsername,
    REDIS_PASSWORD: tcPassword,
    REDIS_HOST: 'cache',
  },
  containerName: `${tcName}-redis`,
  reuse: true,
};

/* Test Containers - MongoDB options */
export const TCMongoOptions: ITestContainerOptions = {
  ports: [
    {
      container: 27017,
      host: 27017,
    },
  ],
  envs: {
    MONGO_INITDB_ROOT_USERNAME: tcUsername,
    MONGO_INITDB_ROOT_PASSWORD: tcPassword,
    MONGO_INITDB_DATABASE: tcDatabaseName,
  },
  containerName: `${tcName}-mongo`,
  reuse: true,
};

/* Test Containers - Postgres options */
export const TCPostgresOptions: ITestContainerOptions = {
  ports: [
    {
      container: 5432,
      host: 5432,
    },
  ],
  envs: {
    POSTGRES_USER: tcUsername,
    POSTGRES_PASSWORD: tcPassword,
    POSTGRES_DB: tcDatabaseName,
  },
  containerName: `${tcName}-postgres`,
  reuse: true,
};

/* Test Containers - MySql options */
export const TCMySqlOptions: ITestContainerOptions = {
  ports: [
    {
      container: 3306,
      host: 3306,
    },
  ],
  envs: {
    //'MYSQL_USER': tcUsername,
    MYSQL_ROOT_PASSWORD: tcPassword,
    MYSQL_PASSWORD: tcPassword,
    MYSQL_DATABASE: tcDatabaseName,
  },
  containerName: `${tcName}-mysql`,
  reuse: true,
};
