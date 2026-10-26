import { DynamicModule, Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AUTH_MODULE_OPTIONS } from './constants/auth.constants.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type { AuthModuleAsyncOptions, AuthModuleOptions } from './interfaces/auth.interface.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { TokenService } from './services/token.service.js';

// `TokenService` pasa secreto, TTL y algoritmo explícitamente en cada `sign()` y
// `JwtStrategy` verifica con passport-jwt, así que `JwtModule` no necesita opciones
// propias (y `useFactory` de `registerAsync` se invoca una sola vez).
const sharedImports = [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})];

const sharedProviders: Provider[] = [
  JwtStrategy,
  TokenService,
  JwtAuthGuard,
  { provide: APP_GUARD, useClass: JwtAuthGuard },
];

/**
 * Requiere que `@tresdoce-nestjs-toolkit/redis` esté registrado (típicamente
 * vía `RedisModule.register(...)` en el `AppModule`) antes de importar este
 * módulo: `TokenService` depende de `RedisService` para persistir refresh tokens.
 */
@Module({})
export class AuthModule {
  static register(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: sharedImports,
      providers: [{ provide: AUTH_MODULE_OPTIONS, useValue: options }, ...sharedProviders],
      exports: [TokenService, JwtAuthGuard],
    };
  }

  /**
   * Igual que `register`, pero resuelve las opciones con una factory.
   *
   * @example
   * ```ts
   * AuthModule.registerAsync({
   *   inject: [ConfigService],
   *   useFactory: (config: ConfigService) => ({
   *     jwtSecret: config.get<string>('config.params.jwt.secret'),
   *     accessTokenTtl: config.get<string>('config.params.jwt.expiresIn'),
   *   }),
   * });
   * ```
   */
  static registerAsync(options: AuthModuleAsyncOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [...(options.imports ?? []), ...sharedImports],
      providers: [
        {
          provide: AUTH_MODULE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        ...sharedProviders,
      ],
      exports: [TokenService, JwtAuthGuard],
    };
  }
}
