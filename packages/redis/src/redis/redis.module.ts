import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientType } from 'redis';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './constants/redis.constants';
import { RedisService } from './services/redis.service';
import { createRedisClient } from './providers/redis-client.provider';
import { RedisOptions } from './interfaces/redis.interface';

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
  constructor(
    @Inject(REDIS_MODULE_OPTIONS) private readonly options: RedisOptions,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

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

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
