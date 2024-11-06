import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';

import { RATE_LIMIT_MODULE_OPTIONS } from './constants/rateLimit.constant';

@Global()
@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> =>
        configService.get<ThrottlerModuleOptions>('config.server.rateLimits'),
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: RATE_LIMIT_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> =>
        configService.get<ThrottlerModuleOptions>('config.server.rateLimits'),
      inject: [ConfigService],
    },
  ],
  exports: [RATE_LIMIT_MODULE_OPTIONS, ThrottlerModule],
})
export class RateLimitModule {}
