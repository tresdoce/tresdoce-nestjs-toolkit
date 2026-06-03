const upMock = jest.fn();
const withStartupTimeoutMock = jest.fn();
const withWaitStrategyMock = jest.fn();
const withDefaultWaitStrategyMock = jest.fn();

jest.mock('testcontainers', () => {
  const chain = {
    withStartupTimeout: withStartupTimeoutMock.mockReturnThis(),
    withWaitStrategy: withWaitStrategyMock.mockReturnThis(),
    withDefaultWaitStrategy: withDefaultWaitStrategyMock.mockReturnThis(),
    up: upMock,
  };

  return {
    DockerComposeEnvironment: jest.fn(() => chain),
    Wait: {
      forHealthCheck: jest.fn(() => 'health-check-strategy'),
    },
  };
});

import { DockerComposeEnvironment, Wait } from 'testcontainers';

import { closeDockerCompose, initDockerCompose } from '../testcontainers';

describe('globalTestContainers options', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    upMock.mockResolvedValue({ down: jest.fn() });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should configure named health check wait strategies', async () => {
    await initDockerCompose(['kafka'], '.', 'docker-compose.yml', 120000, {
      healthCheckWaitStrategyNames: ['container-a', 'container-b'],
    })();

    expect(withStartupTimeoutMock).toHaveBeenCalledWith(120000);
    expect(withWaitStrategyMock).toHaveBeenNthCalledWith(1, 'container-a', 'health-check-strategy');
    expect(withWaitStrategyMock).toHaveBeenNthCalledWith(2, 'container-b', 'health-check-strategy');
    expect(withDefaultWaitStrategyMock).not.toHaveBeenCalled();
  });

  it('should configure the default health check wait strategy for all services', async () => {
    await initDockerCompose(['kafka', 'schema-registry'], '.', 'docker-compose.yml', 120000, {
      useDefaultHealthCheckWaitStrategy: true,
    })();

    expect(withDefaultWaitStrategyMock).toHaveBeenCalledWith('health-check-strategy');
    expect(withWaitStrategyMock).not.toHaveBeenCalled();
  });

  it('should create the docker compose environment with the provided compose path and file', async () => {
    await initDockerCompose(['redis'], '/tmp/compose', 'docker-compose.test.yml')();

    expect(DockerComposeEnvironment).toHaveBeenCalledWith(
      '/tmp/compose',
      'docker-compose.test.yml',
    );
    expect(Wait.forHealthCheck).not.toHaveBeenCalled();
  });

  it('should initialize all compose services when services are empty', async () => {
    await initDockerCompose([], '/tmp/compose', 'docker-compose.test.yml')();

    expect(upMock).toHaveBeenCalledWith([]);
  });

  it('should return undefined on initialization errors', async () => {
    const error = new Error('compose failed');
    upMock.mockRejectedValueOnce(error);

    await expect(initDockerCompose(['redis'])()).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '😰 Error initializing container(s): Error: compose failed',
    );
  });

  it('should use global.__TESTCONTAINERS__ when local environment is not set', async () => {
    const downMock = jest.fn().mockResolvedValue(undefined);
    globalThis.__TESTCONTAINERS__ = { down: downMock } as any;
    jest.resetModules();

    const { closeDockerCompose: closeDockerComposeFresh } =
      await import('../testcontainers/globalTestContainersTD');

    await closeDockerComposeFresh({ removeVolumes: true })();

    expect(downMock).toHaveBeenCalledWith({ removeVolumes: true });
  });
});
