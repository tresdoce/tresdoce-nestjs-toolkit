import { createClient } from 'redis';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from '../redis/constants/redis.constants';
import { createRedisClient } from '../redis/providers/redis-client.provider';

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('createRedisClient', () => {
  let client: { connect: jest.Mock; on: jest.Mock };

  beforeEach(() => {
    client = {
      connect: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(client);
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
});
