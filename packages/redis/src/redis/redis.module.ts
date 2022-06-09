import { DynamicModule, Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientType, RedisClientOptions } from 'redis';

import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './constants/redis.constants';
import { RedisService } from './services/redis.service';
import { createRedisClient } from './providers/redis-client.provider';

@Global()
@Module({})
export class RedisModule implements OnModuleDestroy {
  constructor(
    @Inject(REDIS_MODULE_OPTIONS) private readonly options: RedisClientOptions,
    @Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType,
  ) {}

  static register(options: RedisClientOptions): DynamicModule {
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
      exports: [REDIS_MODULE_OPTIONS, REDIS_CLIENT, RedisService],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      global: true,
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        createRedisClient(),
        RedisService,
        {
          provide: REDIS_MODULE_OPTIONS,
          useFactory: async (configService: ConfigService) =>
            configService.get<RedisClientOptions>('config.redis'),
          inject: [ConfigService],
        },
      ],
      exports: [REDIS_MODULE_OPTIONS, REDIS_CLIENT, RedisService],
    };
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }
}
