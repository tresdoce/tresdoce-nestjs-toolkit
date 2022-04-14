import * as path from 'path';
import { DockerComposeEnvironment } from 'testcontainers';

let environment;
let mongoContainer;

export const initMongoDBContainer = async () => {
  try {
    const composeFilePath = path.resolve(__dirname, './');
    const composeFile = 'docker-compose.yml';

    environment = await new DockerComposeEnvironment(composeFilePath, composeFile).up();
    //console.log(environment);
    mongoContainer = environment.getContainer('mongodb-1');
    global.hostContainer = mongoContainer.getHost();
    return mongoContainer;
  } catch (e) {
    /* istanbul ignore next */
    console.error(`Error initializing mongo container: ${e}`);
  }
};

export const initContainerDB = async () => {
  // Start the docker container
  return await initMongoDBContainer();
};

export const stopDbContainer = async () => {
  /* istanbul ignore next */
  if (mongoContainer) {
    await environment.stop();
    await mongoContainer.stop();
    console.info('Container stopped successfully');
  } else {
    /* istanbul ignore next */
    console.error('Container not initialized');
  }
};
