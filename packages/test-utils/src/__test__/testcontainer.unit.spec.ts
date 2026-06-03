const mockStartedContainer = {
  getHost: jest.fn(),
  getName: jest.fn(),
  getMappedPort: jest.fn(),
  stop: jest.fn(),
};

const mockStart = jest.fn();
const mockWithName = jest.fn();
const mockWithNetworkMode = jest.fn();
const mockWithExposedPorts = jest.fn();
const mockWithEnvironment = jest.fn();
const mockWithCommand = jest.fn();
const mockWithStartupTimeout = jest.fn();
const mockWithWaitStrategy = jest.fn();
const mockWithReuse = jest.fn();

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

const mockGenericContainer = jest.fn(() => mockGenericContainerInstance);

jest.mock('testcontainers', () => ({
  GenericContainer: mockGenericContainer,
  Wait: {
    forHealthCheck: jest.fn(() => 'health-check-strategy'),
  },
  RandomUuid: jest.fn(() => ({
    nextUuid: jest.fn(() => 'generated-id'),
  })),
}));

import { Wait } from 'testcontainers';

import { testContainers } from '../testcontainers';
import {
  TCDynamoDBOptions,
  TCMongoOptions,
  TCMySqlOptions,
  TCPostgresOptions,
  TCRedisOptions,
} from '../fixtures';

describe('TestContainers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
