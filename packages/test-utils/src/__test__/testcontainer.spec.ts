import { testContainers } from '../testcontainers';
import { StartedGenericContainer } from 'testcontainers/build/generic-container/started-generic-container';
import {
  TCRedisOptions,
  TCDynamoDBOptions,
  TCMongoOptions,
  TCMySqlOptions,
  TCPostgresOptions,
  TCElasticSearchOptions,
} from '../fixtures';

jest.setTimeout(70000);
describe('TestContainers', () => {
  describe('Redis', () => {
    let container: testContainers;

    beforeAll(async () => {
      container = await new testContainers('redis:6.2-alpine', {
        ...TCRedisOptions,
        command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456'],
        ports: [
          {
            container: 6379,
            host: 6370,
          },
        ],
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
      //expect(instanceHost).toEqual('localhost');
      expect(instanceHost).toEqual('127.0.0.1');
    });

    it('should be return name of container instance', () => {
      const instanceContainerName = container.getName();
      expect(instanceContainerName).toBeDefined();
      expect(instanceContainerName).toContain(TCRedisOptions.containerName);
    });

    it('should be return mapped port', () => {
      const mappedPort = container.getMappedPort(6379);
      expect(mappedPort).toEqual(6370);
    });
  });

  describe('DynamoDB', () => {
    let container: testContainers;

    beforeAll(async () => {
      container = await new testContainers('amazon/dynamodb-local:latest', {
        ...TCDynamoDBOptions,
        ports: [
          {
            container: 8000,
            host: 8002,
          },
        ],
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

  describe('MongoDB', () => {
    let container: testContainers;

    beforeAll(async () => {
      container = await new testContainers('mongo:5.0', {
        ...TCMongoOptions,
        ports: [
          {
            container: 27017,
            host: 27012,
          },
        ],
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

  describe('MySql', () => {
    let container: testContainers;

    beforeAll(async () => {
      container = await new testContainers('mysql:5.7', {
        ...TCMySqlOptions,
        ports: [
          {
            container: 3306,
            host: 52000,
          },
        ],
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

  describe('Postgres', () => {
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

  describe('ElasticSearch', () => {
    let container: testContainers;

    beforeAll(async () => {
      container = await new testContainers('elasticsearch:8.8.1', {
        ...TCElasticSearchOptions,
        ports: [
          {
            container: 9200,
            host: 9201,
          },
        ],
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
});
