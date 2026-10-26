import type { MockInstance } from 'vitest';
const { upMock, withStartupTimeoutMock, withWaitStrategyMock, withDefaultWaitStrategyMock } =
  vi.hoisted(() => ({
    upMock: vi.fn(),
    withStartupTimeoutMock: vi.fn(),
    withWaitStrategyMock: vi.fn(),
    withDefaultWaitStrategyMock: vi.fn(),
  }));

vi.mock('testcontainers', () => {
  const chain = {
    withStartupTimeout: withStartupTimeoutMock.mockReturnThis(),
    withWaitStrategy: withWaitStrategyMock.mockReturnThis(),
    withDefaultWaitStrategy: withDefaultWaitStrategyMock.mockReturnThis(),
    up: upMock,
  };

  return {
    DockerComposeEnvironment: vi.fn(function () {
      return chain;
    }),
    Wait: {
      forHealthCheck: vi.fn(() => 'health-check-strategy'),
    },
  };
});

import { DockerComposeEnvironment, Wait } from 'testcontainers';

import { closeDockerCompose, initDockerCompose } from '../testcontainers/index.js';

describe('globalTestContainers options', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    upMock.mockResolvedValue({ down: vi.fn() });
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
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
    const downMock = vi.fn().mockResolvedValue(undefined);
    globalThis.__TESTCONTAINERS__ = { down: downMock } as any;
    vi.resetModules();

    const { closeDockerCompose: closeDockerComposeFresh } =
      await import('../testcontainers/globalTestContainersTD.js');

    await closeDockerComposeFresh({ removeVolumes: true })();

    expect(downMock).toHaveBeenCalledWith({ removeVolumes: true });
  });

  it('should stop the started environment and clear the global reference', async () => {
    const downMock = vi.fn().mockResolvedValue(undefined);
    upMock.mockResolvedValueOnce({ down: downMock });

    await initDockerCompose(['redis'])();
    expect(globalThis.__TESTCONTAINERS__).toBeDefined();

    await closeDockerCompose()();

    expect(downMock).toHaveBeenCalledTimes(1);
    expect(globalThis.__TESTCONTAINERS__).toBeUndefined();
  });

  it('should log an error when the environment was not initialized', async () => {
    globalThis.__TESTCONTAINERS__ = undefined;
    vi.resetModules();

    const { closeDockerCompose: closeDockerComposeFresh } =
      await import('../testcontainers/globalTestContainersTD.js');

    await expect(closeDockerComposeFresh()()).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith('😒 Container(s) not initialized.');
  });
});
