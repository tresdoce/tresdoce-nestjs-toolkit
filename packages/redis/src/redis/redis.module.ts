import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { RedisClientType } from 'redis';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './constants/redis.constants.js';
import { RedisService } from './services/redis.service.js';
import { createRedisClient } from './providers/redis-client.provider.js';
import type { RedisOptions } from './interfaces/redis.interface.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    createRedisClient(),
    RedisService,
    {
      provide: REDIS_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<RedisOptions>('config.redis'),
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  static register(options: RedisOptions): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      providers: [
        createRedisClient(),
        RedisService,
        {
          provide: REDIS_MODULE_OPTIONS,
          useValue: options,
        },
      ],
      exports: [REDIS_CLIENT, RedisService],
    };
  }

  async onModuleDestroy(): Promise<void> {
    const client = this.redisClient;
    if (!client || client.isOpen === false) return;

    // `quit()` is deprecated since node-redis v5: prefer `close()` (waits for pending
    // commands) and fall back to `quit()` for clients/mocks that only implement it.
    if (typeof client.close === 'function') {
      await client.close();
    } else {
      await client.quit();
    }
  }
}
