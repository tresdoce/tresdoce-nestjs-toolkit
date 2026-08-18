import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AUTH_MODULE_OPTIONS } from './constants/auth.constants';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthModuleOptions } from './interfaces/auth.interface';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenService } from './services/token.service';

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
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: options.jwtSecret,
          signOptions: {
            expiresIn: (options.accessTokenTtl ?? '15m') as JwtSignOptions['expiresIn'],
          },
        }),
      ],
      providers: [
        { provide: AUTH_MODULE_OPTIONS, useValue: options },
        JwtStrategy,
        TokenService,
        Reflector,
        JwtAuthGuard,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
      ],
      exports: [TokenService, JwtAuthGuard],
    };
  }
}
