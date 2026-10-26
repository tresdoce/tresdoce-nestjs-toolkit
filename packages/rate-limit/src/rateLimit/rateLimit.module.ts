import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, type ThrottlerModuleOptions } from '@nestjs/throttler';

import { RATE_LIMIT_MODULE_OPTIONS } from './constants/rateLimit.constant.js';

/**
 * Resuelve las opciones de `ThrottlerModule` desde `config.server.rateLimits`.
 * Si la key no está definida devuelve `{ throttlers: [] }`: el `ThrottlerGuard` no limita
 * ningún request (y lo advierte en el log) en lugar de romper al iniciar la app.
 */
export const rateLimitOptionsFactory = (configService: ConfigService): ThrottlerModuleOptions =>
  configService.get<ThrottlerModuleOptions>('config.server.rateLimits') ?? { throttlers: [] };

@Global()
@Module({
  imports: [
    ConfigModule,
    ThrottlerModule.forRootAsync({
      useFactory: rateLimitOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  providers: [
    {
      provide: RATE_LIMIT_MODULE_OPTIONS,
      useFactory: rateLimitOptionsFactory,
      inject: [ConfigService],
    },
  ],
  exports: [RATE_LIMIT_MODULE_OPTIONS, ThrottlerModule],
})
export class RateLimitModule {}
