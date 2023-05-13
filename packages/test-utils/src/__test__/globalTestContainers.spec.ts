import { StartedDockerComposeEnvironment } from 'testcontainers';
import { closeDockerCompose, initDockerCompose } from '../testcontainers';
import path from 'path';

describe('globalTestContainers', () => {
  const composeFilePath = path.resolve(__dirname, '..', 'fixtures', 'docker-compose');
  const composeFile = 'docker-compose.yml';

  it('should be initialize service from docker-compose.yml', async () => {
    const services = ['mongo'];
    const environment: StartedDockerComposeEnvironment = await initDockerCompose(
      services,
      composeFilePath,
      composeFile,
    )();
    expect(environment).toBeDefined();
    expect(environment).toBeInstanceOf(StartedDockerComposeEnvironment);
    await closeDockerCompose({ removeVolumes: true })();
  });

  it('should be initialize all services from docker-compose.yml', async () => {
    const services = [];
    const environment: StartedDockerComposeEnvironment = await initDockerCompose(
      services,
      composeFilePath,
      composeFile,
    )();
    expect(environment).toBeDefined();
    expect(environment).toBeInstanceOf(StartedDockerComposeEnvironment);
    await closeDockerCompose({ removeVolumes: true })();
  });

  it('should be initialize services from docker-compose.yml in default path and filename', async () => {
    const services = [];
    const environment: StartedDockerComposeEnvironment = await initDockerCompose(services)();
    expect(environment).toBeDefined();
    expect(environment).toBeInstanceOf(StartedDockerComposeEnvironment);
    await closeDockerCompose({ removeVolumes: true })();
  });
});
