import { DynamicModule, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { RedisOptions } from './interfaces/redis.interface';
export declare class RedisModule implements OnModuleDestroy {
    private readonly options;
    private readonly redisClient;
    constructor(options: RedisOptions, redisClient: RedisClientType);
    static register(options: RedisOptions): DynamicModule;
    onModuleDestroy(): Promise<void>;
}
