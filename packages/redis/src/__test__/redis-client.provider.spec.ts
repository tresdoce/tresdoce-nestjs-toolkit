import type { Mock } from 'vitest';
import { Logger } from '@nestjs/common';
import { createClient } from 'redis';

import {
  REDIS_CLIENT,
  REDIS_MODULE_OPTIONS,
  REDIS_MSG_ERROR_CONNECTED,
  REDIS_MSG_IS_READY,
  REDIS_MSG_SUCCESSFULLY_CONNECTED,
} from '../redis/constants/redis.constants.js';
import { buildRedisUrl, createRedisClient } from '../redis/providers/redis-client.provider.js';

vi.mock('redis', () => ({
  createClient: vi.fn(),
}));

describe('createRedisClient', () => {
  let client: { connect: Mock; on: Mock };

  let callOrder: string[];

  beforeEach(() => {
    callOrder = [];
    client = {
      connect: vi.fn(async () => {
        callOrder.push('connect');
      }),
      on: vi.fn((event: string) => {
        callOrder.push(`on:${event}`);
      }),
    };
    (createClient as Mock).mockReturnValue(client);
  });

  it('should create a redis client provider', async () => {
    const provider = createRedisClient() as any;

    expect(provider.provide).toEqual(REDIS_CLIENT);
    expect(provider.inject).toEqual([REDIS_MODULE_OPTIONS]);

    await provider.useFactory({
      host: 'localhost',
      port: 6379,
    });

    expect(createClient).toHaveBeenCalledWith({
      host: 'localhost',
      port: 6379,
      url: expect.stringMatching(/^redis:\/\/localhost:6379$/),
      name: expect.any(String),
    });
    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(client.on).toHaveBeenCalledTimes(3);
  });

  it('should create a redis client with auth, database and custom options', async () => {
    const provider = createRedisClient() as any;

    const result = await provider.useFactory({
      protocol: 'rediss',
      host: 'redis.local',
      port: 6380,
      username: 'default',
      password: 'secret',
      database: 2,
      name: 'client-name',
    });

    expect(result).toBe(client);
    expect(createClient).toHaveBeenCalledWith({
      protocol: 'rediss',
      host: 'redis.local',
      port: 6380,
      username: 'default',
      password: 'secret',
      database: 2,
      name: 'client-name',
      url: 'rediss://default:secret@redis.local:6380/2',
    });
  });

  it('should register event listeners before connecting', async () => {
    const provider = createRedisClient() as any;
    await provider.useFactory({ host: 'localhost', port: 6379 });

    expect(callOrder).toEqual(['on:connect', 'on:ready', 'on:error', 'connect']);
  });

  it('should log connection events', async () => {
    const logSpy = vi.spyOn(Logger, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);

    const provider = createRedisClient() as any;
    await provider.useFactory({ host: 'localhost', port: 6379 });

    const handlers = Object.fromEntries(client.on.mock.calls.map(([event, fn]) => [event, fn]));
    handlers.connect();
    handlers.ready();
    handlers.error(new Error('ECONNREFUSED'));

    expect(logSpy).toHaveBeenCalledWith(REDIS_MSG_SUCCESSFULLY_CONNECTED, 'RedisModule');
    expect(logSpy).toHaveBeenCalledWith(REDIS_MSG_IS_READY, 'RedisModule');
    expect(errorSpy).toHaveBeenCalledWith(
      `${REDIS_MSG_ERROR_CONNECTED} ECONNREFUSED`,
      'RedisModule',
    );

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe('buildRedisUrl', () => {
  it('should build url without credentials', () => {
    expect(buildRedisUrl({ host: 'localhost', port: 6379 })).toBe('redis://localhost:6379');
  });

  it('should build url with password only', () => {
    expect(buildRedisUrl({ host: 'localhost', port: 6379, password: 'secret' })).toBe(
      'redis://:secret@localhost:6379',
    );
  });

  it('should build url with username only', () => {
    expect(buildRedisUrl({ host: 'localhost', port: 6379, username: 'default' })).toBe(
      'redis://default@localhost:6379',
    );
  });

  it('should build url with database and tls protocol', () => {
    expect(
      buildRedisUrl({
        protocol: 'rediss',
        host: 'redis.local',
        port: 6380,
        username: 'user',
        password: 'pass',
        database: 3,
      }),
    ).toBe('rediss://user:pass@redis.local:6380/3');
  });
});
