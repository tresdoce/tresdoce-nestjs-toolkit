import { DynamicModule, Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import { RATE_LIMIT_MODULE_OPTIONS } from './constants/rateLimit.constant';

@Module({})
export class RateLimitCoreModule {
  static register(options: ThrottlerModuleOptions): DynamicModule {
    return {
      module: RateLimitCoreModule,
      imports: [ThrottlerModule.forRoot(options)],
    };
  }

  static registerAsync(): DynamicModule {
    return {
      module: RateLimitCoreModule,
      imports: [
        ThrottlerModule.forRootAsync({
          inject: [RATE_LIMIT_MODULE_OPTIONS],
          useFactory: (options: ThrottlerModuleOptions) => options,
        }),
      ],
    };
  }
}
