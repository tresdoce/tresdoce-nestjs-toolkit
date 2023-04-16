import { closeDockerCompose, initDockerCompose } from '../testcontainers';
import path from 'path';
import { StartedDockerComposeEnvironment } from 'testcontainers';

describe('globalTestContainers', () => {
  const composeFilePath = path.resolve(__dirname, '..', 'fixtures', 'docker-compose');
  const composeFile = 'docker-compose.yml';

  it('should be initialize service from docker-compose.yml', async () => {
    const services = ['mongo'];
    await initDockerCompose(services, composeFilePath, composeFile)();
    expect(global.__TESTCONTAINERS__).toBeDefined();
    expect(global.__TESTCONTAINERS__).toBeInstanceOf(StartedDockerComposeEnvironment);
    await closeDockerCompose({ removeVolumes: false })();
  });

  it('should be initialize all services from docker-compose.yml', async () => {
    const services = [];
    await initDockerCompose(services, composeFilePath, composeFile)();
    expect(global.__TESTCONTAINERS__).toBeDefined();
    expect(global.__TESTCONTAINERS__).toBeInstanceOf(StartedDockerComposeEnvironment);
    await closeDockerCompose({ removeVolumes: false })();
  });

  it('should be initialize services from docker-compose.yml in default path and filename', async () => {
    const services = [];
    await initDockerCompose(services)();
    expect(global.__TESTCONTAINERS__).toBeDefined();
    expect(global.__TESTCONTAINERS__).toBeInstanceOf(StartedDockerComposeEnvironment);
    await closeDockerCompose({ removeVolumes: false })();
  });
});
