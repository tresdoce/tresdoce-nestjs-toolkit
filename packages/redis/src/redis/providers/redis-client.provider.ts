import { Logger, Provider } from '@nestjs/common';
import { createClient } from 'redis';
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
    const {
      protocol = 'redis',
      host,
      port,
      username,
      password,
      database,
      name = uuidv4(),
    } = options;

    // redis[s]://[[username][:password]@][host][:port][/db-number]
    const redisUsername = username ? `${username}` : '';
    const redisPassword = password ? `:${password}@` : '';
    const db = database ? `/${database}` : '';

    const url = `${protocol}://${redisUsername}${redisPassword}${host}:${port}${db}`;

    const client = createClient({ ...options, url, name });
    await client.connect();

    /* istanbul ignore next */
    client.on('ready', () => Logger.log(REDIS_MSG_IS_READY));
    /* istanbul ignore next */
    client.on('connect', () => Logger.log(REDIS_MSG_SUCCESSFULLY_CONNECTED));
    /* istanbul ignore next */
    client.on('error', (error) => Logger.error(`${REDIS_MSG_ERROR_CONNECTED} ${error}`));

    return client;
  },
  inject: [REDIS_MODULE_OPTIONS],
});
