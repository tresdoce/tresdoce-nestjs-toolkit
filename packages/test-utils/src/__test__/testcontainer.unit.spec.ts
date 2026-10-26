const {
  mockStartedContainer,
  mockStart,
  mockWithName,
  mockWithNetworkMode,
  mockWithExposedPorts,
  mockWithEnvironment,
  mockWithCommand,
  mockWithStartupTimeout,
  mockWithWaitStrategy,
  mockWithReuse,
  mockGenericContainerInstance,
  mockGenericContainer,
} = vi.hoisted(() => {
  const mockStartedContainer = {
    getHost: vi.fn(),
    getName: vi.fn(),
    getMappedPort: vi.fn(),
    stop: vi.fn(),
  };

  const mockStart = vi.fn();
  const mockWithName = vi.fn();
  const mockWithNetworkMode = vi.fn();
  const mockWithExposedPorts = vi.fn();
  const mockWithEnvironment = vi.fn();
  const mockWithCommand = vi.fn();
  const mockWithStartupTimeout = vi.fn();
  const mockWithWaitStrategy = vi.fn();
  const mockWithReuse = vi.fn();

  const mockGenericContainerInstance = {
    withName: mockWithName.mockReturnThis(),
    withNetworkMode: mockWithNetworkMode.mockReturnThis(),
    withExposedPorts: mockWithExposedPorts.mockReturnThis(),
    withEnvironment: mockWithEnvironment.mockReturnThis(),
    withCommand: mockWithCommand.mockReturnThis(),
    withStartupTimeout: mockWithStartupTimeout.mockReturnThis(),
    withWaitStrategy: mockWithWaitStrategy.mockReturnThis(),
    withReuse: mockWithReuse.mockReturnThis(),
    start: mockStart,
  };

  const mockGenericContainer = vi.fn(function () {
    return mockGenericContainerInstance;
  });

  return {
    mockStartedContainer,
    mockStart,
    mockWithName,
    mockWithNetworkMode,
    mockWithExposedPorts,
    mockWithEnvironment,
    mockWithCommand,
    mockWithStartupTimeout,
    mockWithWaitStrategy,
    mockWithReuse,
    mockGenericContainerInstance,
    mockGenericContainer,
  };
});

vi.mock('testcontainers', () => ({
  GenericContainer: mockGenericContainer,
  Wait: {
    forHealthCheck: vi.fn(() => 'health-check-strategy'),
  },
  RandomUuid: vi.fn(function () {
    return { nextUuid: vi.fn(() => 'generated-id') };
  }),
}));

const { removeContainerByNameMock } = vi.hoisted(() => ({ removeContainerByNameMock: vi.fn() }));

vi.mock('../utilities/docker-retry.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../utilities/docker-retry.js')>()),
  removeContainerByName: removeContainerByNameMock,
}));

import { Wait } from 'testcontainers';

import { testContainers } from '../testcontainers/index.js';
import {
  TCDynamoDBOptions,
  TCMongoOptions,
  TCMySqlOptions,
  TCPostgresOptions,
  TCRedisOptions,
} from '../fixtures/index.js';

describe('TestContainers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (testContainers as any)._instance = undefined;

    mockStartedContainer.getHost.mockReturnValue('docker');
    mockStartedContainer.getName.mockReturnValue(TCRedisOptions.containerName);
    mockStartedContainer.getMappedPort.mockReturnValue(6370);
    mockStartedContainer.stop.mockResolvedValue(undefined);
    mockStart.mockResolvedValue(mockStartedContainer);
  });

  it('should configure and start a container with all supported options', async () => {
    const container = new testContainers('redis:8.2.1-alpine', {
      ...TCRedisOptions,
      command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456'],
      networkName: 'test-network',
      startupTimeout: 10000,
      strategyHealthCheck: true,
      reuse: true,
      ports: [
        {
          container: 6379,
          host: 6370,
        },
      ],
    });

    await container.start();

    expect(container).toBeInstanceOf(testContainers);
    expect(mockGenericContainer).toHaveBeenCalledWith('redis:8.2.1-alpine');
    expect(mockWithName).toHaveBeenCalledWith(TCRedisOptions.containerName);
    expect(mockWithNetworkMode).toHaveBeenCalledWith('test-network');
    expect(mockWithExposedPorts).toHaveBeenCalledWith({ container: 6379, host: 6370 });
    expect(mockWithEnvironment).toHaveBeenCalledWith(TCRedisOptions.envs);
    expect(mockWithCommand).toHaveBeenCalledWith([
      'redis-server',
      '--appendonly',
      'yes',
      '--requirepass',
      '123456',
    ]);
    expect(mockWithStartupTimeout).toHaveBeenCalledWith(10000);
    expect(mockWithWaitStrategy).toHaveBeenCalledWith('health-check-strategy');
    expect(mockWithReuse).toHaveBeenCalledTimes(1);
    expect(Wait.forHealthCheck).toHaveBeenCalledTimes(1);
    expect(global.hostContainer).toBe('docker');
    expect(container.isStarted()).toBe(true);
  });

  it('should use a generated container name when no name is provided', async () => {
    const container = new testContainers('redis:8.2.1-alpine', {
      ports: [{ container: 6379, host: 6370 }],
    });

    await container.start();

    expect(mockWithName).toHaveBeenCalledWith('test-container-generated-id');
  });

  it('should return container metadata helpers', async () => {
    const container = new testContainers('redis:8.2.1-alpine', TCRedisOptions);

    await container.start();

    expect(container.getContainer()).toBe(mockStartedContainer);
    expect(container.getEnvs()).toEqual(TCRedisOptions.envs);
    expect(container.getHost()).toBe('docker');
    expect(container.getName()).toBe(TCRedisOptions.containerName);
    expect(container.getMappedPort(6379)).toBe(6370);
  });

  it('should stop a started container', async () => {
    const container = new testContainers('redis:8.2.1-alpine', TCRedisOptions);

    await container.start();
    await container.stop({ removeVolumes: true });

    expect(mockStartedContainer.stop).toHaveBeenCalledWith({ removeVolumes: true });
  });

  it('should indicate that a container is not started', () => {
    const container = new testContainers('redis:8.2.1-alpine', TCRedisOptions);

    expect(container.isStarted()).toBe(false);
  });

  it('should return null envs when envs are not configured', () => {
    const container = new testContainers('redis:8.2.1-alpine', {});

    expect(container.getEnvs()).toBeNull();
  });

  it('should reuse singleton instances through getInstance', () => {
    const instance = testContainers.getInstance('postgres:17', TCPostgresOptions);
    const sameInstance = testContainers.getInstance('mysql:9.4.0', TCMySqlOptions);

    expect(instance).toBe(sameInstance);
    expect(instance).toBeInstanceOf(testContainers);
  });

  it('should throw when constructing a second singleton instance directly', () => {
    testContainers.getInstance('postgres:17', TCPostgresOptions);

    expect(() => new testContainers('mongo:8.0.13', TCMongoOptions, true as any)).toThrow(
      'Use testContainers.getInstance() instead of new.',
    );
  });

  it('should support the exported fixture option presets', () => {
    expect(TCRedisOptions).toBeDefined();
    expect(TCDynamoDBOptions).toBeDefined();
    expect(TCMongoOptions).toBeDefined();
    expect(TCMySqlOptions).toBeDefined();
    expect(TCPostgresOptions).toBeDefined();
  });

  it('should not register non-singleton instances as the singleton', () => {
    const container = new testContainers('redis:8.2.1-alpine', TCRedisOptions);
    const singleton = testContainers.getInstance('postgres:17', TCPostgresOptions);

    expect(singleton).not.toBe(container);
    expect(() => new testContainers('mongo:8.0.13', TCMongoOptions)).not.toThrow();
  });

  it('should log the image name when start fails without options', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    mockStart.mockRejectedValueOnce(new Error('boom'));
    const container = new testContainers('redis:8.2.1-alpine');

    await expect(container.start()).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '😰 [redis:8.2.1-alpine] Error initializing container: Error: boom',
    );
    expect(container.isStarted()).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it('should log when stopping a container that was not started', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    const container = new testContainers('redis:8.2.1-alpine');

    await expect(container.stop()).resolves.toBeUndefined();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '😒 [redis:8.2.1-alpine] Container not initialized',
    );
    consoleErrorSpy.mockRestore();
  });

  describe('transient Docker errors', () => {
    const epipe = Object.assign(new Error('write EPIPE'), { code: 'EPIPE' });

    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should retry the start and remove the half-created container with the fixed name', async () => {
      mockStart.mockRejectedValueOnce(epipe).mockResolvedValue(mockStartedContainer);
      const container = new testContainers('mongo:8.0', { containerName: 'fixed-name' });

      const started = container.start();
      await vi.advanceTimersByTimeAsync(2000);
      await started;

      expect(mockStart).toHaveBeenCalledTimes(2);
      expect(removeContainerByNameMock).toHaveBeenCalledWith('fixed-name');
      expect(container.isStarted()).toBe(true);
    });

    it('should retry without removing anything when the container has no fixed name', async () => {
      mockStart.mockRejectedValueOnce(epipe).mockResolvedValue(mockStartedContainer);
      const container = new testContainers('mongo:8.0');

      const started = container.start();
      await vi.advanceTimersByTimeAsync(2000);
      await started;

      expect(mockStart).toHaveBeenCalledTimes(2);
      expect(removeContainerByNameMock).not.toHaveBeenCalled();
    });
  });
});
