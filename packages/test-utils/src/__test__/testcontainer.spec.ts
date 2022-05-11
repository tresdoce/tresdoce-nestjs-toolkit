import * as _ from 'lodash';
import { testContainers, ITestContainerOptions } from '../testcontainers';
import { StartedGenericContainer } from 'testcontainers/dist/generic-container/started-generic-container';

const imageContainer: string = 'redis:latest';
const testContainerOptions: ITestContainerOptions = {
  ports: {
    container: 6379,
    host: 6379,
  },
  envs: {
    REDIS_USERNAME: 'root',
    REDIS_PASSWORD: '123456',
    REDIS_HOST: 'cache',
  },
  containerName: `tresdoce-test-container-redis`,
  reuse: true,
};

jest.setTimeout(60000);
describe('testContainers with configuration', () => {
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers(imageContainer, testContainerOptions);
    //console.log(container);
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
      await new testContainers('postgres:13', testContainerOptions);
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
    expect(instanceEnvs).toEqual(testContainerOptions.envs);
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
    expect(instanceContainerName).toContain(testContainerOptions.containerName);
  });
});
