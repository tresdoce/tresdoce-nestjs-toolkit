import {Global, DynamicModule, Module} from '@nestjs/common';
import {RedisModuleAsyncOptions, RedisModuleOptions} from './interfaces/redis.interface';
import {RedisCoreModule} from './redis-core.module';

@Global()
@Module({})
export class RedisModule {
    static register(
        options: RedisModuleOptions | RedisModuleOptions[],
    ): DynamicModule {
        return {
            global: true,
            module: RedisModule,
            imports: [RedisCoreModule.register(options)],
        };
    }

    static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
        return {
            global: true,
            module: RedisModule,
            imports: [RedisCoreModule.forRootAsync(options)],
        };
    }
}
