import { testContainers } from '../testcontainers';
import { StartedGenericContainer } from 'testcontainers/dist/generic-container/started-generic-container';

import { TCRedisOptions, TCMongoOptions, TCMySqlOptions, TCPostgresOptions } from '../fixtures';

jest.setTimeout(70000);
describe('testContainers - Redis', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('redis:6.2-alpine', {
      ...TCRedisOptions,
      command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456'],
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(container).toBeInstanceOf(testContainers);
  });

  it('should be return exception of instance', async () => {
    try {
      await new testContainers('postgres:13', TCPostgresOptions);
    } catch (error) {
      expect(error.message).toBe('Use testContainers.getInstance() instead of new.');
    }
  });

  it('should be get instance of test container', () => {
    const instance = testContainers.getInstance();
    expect(instance).toBeInstanceOf(testContainers);
  });

  it('should be return envs of instance', () => {
    const instanceEnvs = container.getEnvs();
    expect(instanceEnvs).toEqual(TCRedisOptions.envs);
  });

  it('should be return container instance', () => {
    const instanceContainer = container.getContainer();
    expect(instanceContainer).toBeDefined();
    expect(instanceContainer).toBeInstanceOf(StartedGenericContainer);
  });

  it('should be return host of container instance', () => {
    const instanceHost = container.getHost();
    expect(instanceHost).toBeDefined();
    expect(instanceHost).toEqual('localhost');
  });

  it('should be return name of container instance', () => {
    const instanceContainerName = container.getName();
    expect(instanceContainerName).toBeDefined();
    expect(instanceContainerName).toContain(TCRedisOptions.containerName);
  });
});

describe('testContainers - MongoDB', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('mongo:5.0', {
      ...TCMongoOptions,
      ports: {
        container: 27017,
        host: 27012,
      },
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(container).toBeInstanceOf(testContainers);
  });
});

describe('testContainers - MySql', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('mysql:5.7', {
      ...TCMySqlOptions,
      ports: {
        container: 3306,
        host: 52000,
      },
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(container).toBeInstanceOf(testContainers);
  });
});

describe('testContainers - Postgres', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('postgres:13', TCPostgresOptions);
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  it('should be defined', () => {
    expect(container).toBeDefined();
    expect(container).toBeInstanceOf(testContainers);
  });
});
