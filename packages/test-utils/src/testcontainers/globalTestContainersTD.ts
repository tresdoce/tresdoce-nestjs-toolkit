import { DockerComposeEnvironment, StartedDockerComposeEnvironment } from 'testcontainers';
import { ComposeDownOptions } from 'testcontainers/build/container-runtime';
import _ from 'lodash';

let environment: StartedDockerComposeEnvironment;

export const initDockerCompose = (
  _services?: Array<string>,
  _composeFilePath = '.',
  _composeFile = 'docker-compose.yml',
) => {
  return async (): Promise<StartedDockerComposeEnvironment> => {
    console.info(`🐳 Initialize docker-compose...`);
    _.isEmpty(_services)
      ? console.log(`• All services from ${_composeFile}`)
      : console.log(`• Services from ${_composeFile}: ${_services.join(', ')}`);
    try {
      environment = await new DockerComposeEnvironment(_composeFilePath, _composeFile).up(
        _services,
      );
      global.__TESTCONTAINERS__ = environment;
      console.info(`✨ Container(s) initialized.`);
      return environment;
    } catch (_error) {
      /* istanbul ignore next */
      console.error(`😰 Error initializing container(s): ${_error}`);
    }
  };
};

export const closeDockerCompose = (_options?: Partial<ComposeDownOptions>) => {
  return async (): Promise<void> => {
    console.info('🐳 Terminate docker-compose...');
    try {
      await environment.down(_options);
      console.info(`👌 Container(s) stopped successfully.`);
    } catch (_error) {
      /* istanbul ignore next */
      console.error(`😒 Container(s) not initialized.`);
    }
  };
};
