import { GenericContainer } from 'testcontainers';

let container;

export const initMongoDBContainer = async () => {
  try {
    container = await new GenericContainer('mongo:5')
      .withEnv('MONGO_INITDB_ROOT_USERNAME', 'root')
      .withEnv('MONGO_INITDB_ROOT_PASSWORD', '123456')
      .withEnv('MONGO_INITDB_DATABASE', 'test_db')
      .withName('test-mongo-typeorm')
      .withExposedPorts({
        container: 27017,
        host: 27017,
      })
      .withStartupTimeout(1000000)
      .withReuse()
      .start();

    global.hostContainer = container.getHost();

    return container;
  } catch (e) {
    /* istanbul ignore next */
    console.error(`Error initializing container: ${e}`);
  }
};

export const initPostgresDBContainer = async () => {
  try {
    container = await new GenericContainer('postgres:13')
      .withEnv('POSTGRES_USER', 'root')
      .withEnv('POSTGRES_PASSWORD', '123456')
      .withEnv('POSTGRES_DB', 'test_db')
      .withName('test-postgres-typeorm')
      .withExposedPorts({
        container: 5432,
        host: 5432,
      })
      .withReuse()
      .start();

    global.hostContainer = container.getHost();

    return container;
  } catch (e) {
    /* istanbul ignore next */
    console.error(`Error initializing container: ${e}`);
  }
};

export const initMySqlDBContainer = async () => {
  try {
    container = await new GenericContainer('mysql:5.7')
      //.withEnv('MYSQL_USER', 'root')
      .withEnv('MYSQL_PASSWORD', '123456')
      .withEnv('MYSQL_ROOT_PASSWORD', '123456')
      .withEnv('MYSQL_DATABASE', 'test_db')
      .withName('test-mysql-typeorm')
      .withExposedPorts({
        container: 3306,
        host: 3306,
      })
      .withReuse()
      .start();

    global.hostContainer = container.getHost();

    return container;
  } catch (e) {
    /* istanbul ignore next */
    console.error(`Error initializing container: ${e}`);
  }
};

export const stopContainer = async () => {
  /* istanbul ignore next */
  if (container) {
    await container.stop({
      removeVolumes: false,
    });
    console.info('Container stopped successfully');
  } else {
    /* istanbul ignore next */
    console.error('Container not initialized');
  }
};
