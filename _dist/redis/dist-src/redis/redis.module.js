var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RedisModule_1;
import { Global, Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_CLIENT, REDIS_MODULE_OPTIONS } from './constants/redis.constants';
import { RedisService } from './services/redis.service';
import { createRedisClient } from './providers/redis-client.provider';
let RedisModule = RedisModule_1 = class RedisModule {
    constructor(options, redisClient) {
        this.options = options;
        this.redisClient = redisClient;
    }
    static register(options) {
        return {
            global: true,
            module: RedisModule_1,
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
};
RedisModule = RedisModule_1 = __decorate([
    Global(),
    Module({
        imports: [ConfigModule],
        providers: [
            createRedisClient(),
            RedisService,
            {
                provide: REDIS_MODULE_OPTIONS,
                useFactory: async (configService) => configService.get('config.redis'),
                inject: [ConfigService],
            },
        ],
        exports: [REDIS_CLIENT, RedisService],
    }),
    __param(0, Inject(REDIS_MODULE_OPTIONS)),
    __param(1, Inject(REDIS_CLIENT)),
    __metadata("design:paramtypes", [Object, Object])
], RedisModule);
export { RedisModule };
