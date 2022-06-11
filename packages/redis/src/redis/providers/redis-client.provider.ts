import { Provider } from '@nestjs/common';
import Redis from 'redis';
import { v4 as uuidv4 } from 'uuid';

import {
  REDIS_CLIENT,
  REDIS_MODULE_OPTIONS,
  REDIS_MSG_ERROR_CONNECTED,
  REDIS_MSG_IS_READY,
  REDIS_MSG_SUCCESSFULLY_CONNECTED,
} from '../constants/redis.constants';
import { RedisOptions } from '../interfaces/redis.interface';

export const createRedisClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisOptions) => {
    console.log('REDIS OPTS: ', options);
    const {
      protocol = 'redis',
      host,
      port,
      username,
      password,
      database = 0,
      name = uuidv4(),
    } = options;

    // redis[s]://[[username][:password]@][host][:port][/db-number]
    const url = `${protocol}://${username ? `${username}` : ''}${
      password ? `:${password}@` : ''
    }${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}`;
    const client = Redis.createClient({ url, name });
    await client.connect();

    client.on('ready', () => console.log(REDIS_MSG_IS_READY));
    client.on('connect', () => console.log(REDIS_MSG_SUCCESSFULLY_CONNECTED));
    client.on('error', (error) => console.error(`${REDIS_MSG_ERROR_CONNECTED} ${error}`));

    return client;
  },
  inject: [REDIS_MODULE_OPTIONS],
});
