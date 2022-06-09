import { Provider } from '@nestjs/common';
import Redis, { RedisClientOptions } from 'redis';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from '../constants/redis.constants';

export const createRedisClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisClientOptions) => {
    console.log('REDIS OPTS: ', options);
    const client = Redis.createClient(options);

    await client.connect();

    client.on('ready', () => console.log('Redis is ready!'));
    client.on('connect', () => console.log('Successfully connected to Redis!'));
    client.on('error', (error) => console.error(`Error connecting to Redis: ${error}`));

    return client;
  },
  inject: [REDIS_MODULE_OPTIONS],
});
