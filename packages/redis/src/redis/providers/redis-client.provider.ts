import { Logger, type Provider } from '@nestjs/common';
import { createClient } from 'redis';
import { randomUUID } from 'node:crypto';

import {
  REDIS_CLIENT,
  REDIS_MODULE_OPTIONS,
  REDIS_MSG_ERROR_CONNECTED,
  REDIS_MSG_IS_READY,
  REDIS_MSG_SUCCESSFULLY_CONNECTED,
} from '../constants/redis.constants.js';
import type { RedisOptions } from '../interfaces/redis.interface.js';

const LOGGER_CONTEXT = 'RedisModule';

/**
 * Builds a Redis connection URL.
 * redis[s]://[[username][:password]@][host][:port][/db-number]
 */
export const buildRedisUrl = ({
  protocol = 'redis',
  host,
  port,
  username,
  password,
  database,
}: RedisOptions): string => {
  const credentials =
    username || password ? `${username ?? ''}${password ? `:${password}` : ''}@` : '';
  const db = database ? `/${database}` : '';

  return `${protocol}://${credentials}${host}:${port}${db}`;
};

export const createRedisClient = (): Provider => ({
  provide: REDIS_CLIENT,
  useFactory: async (options: RedisOptions) => {
    const { name = randomUUID() } = options;
    const url = buildRedisUrl(options);

    const client = createClient({ ...options, url, name });

    // Listeners must be attached before connect(): otherwise the first
    // 'connect'/'ready' events are lost and early 'error' events are unhandled.
    client.on('connect', () => Logger.log(REDIS_MSG_SUCCESSFULLY_CONNECTED, LOGGER_CONTEXT));
    client.on('ready', () => Logger.log(REDIS_MSG_IS_READY, LOGGER_CONTEXT));
    client.on('error', (error: Error) =>
      Logger.error(`${REDIS_MSG_ERROR_CONNECTED} ${error.message}`, LOGGER_CONTEXT),
    );

    await client.connect();

    return client;
  },
  inject: [REDIS_MODULE_OPTIONS],
});
