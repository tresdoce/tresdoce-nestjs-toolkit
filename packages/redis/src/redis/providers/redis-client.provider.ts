import { Provider } from '@nestjs/common';
import Redis from 'redis';
import { v4 as uuidv4 } from 'uuid';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from '../constants/redis.constants';
import { RedisOptions } from '../interfaces/redis.interface';

export const createRedisClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisOptions) => {
    console.log('REDIS OPTS: ', options);
    const { protocol, host, port, username, password, database = 0, name = uuidv4() } = options;
    const url = `${protocol || 'redis'}://${username ? `${username}:` : ''}${
      password ? `${password}@` : ''
    }${host}${port ? `:${port}` : ''}`;
    const client = Redis.createClient({
      url,
      name,
      database,
    });

    await client.connect();

    client.on('ready', () => console.log('Redis is ready!'));
    client.on('connect', () => console.log('Successfully connected to Redis!'));
    client.on('error', (error) => console.error(`Error connecting to Redis: ${error}`));

    return client;
  },
  inject: [REDIS_MODULE_OPTIONS],
});
