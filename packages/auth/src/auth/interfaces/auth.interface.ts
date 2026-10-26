import type { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';

/**
 * Payload que se firma dentro del access token y que termina poblando
 * `request.user` (leído, entre otros, por `RolesGuard` de `@tresdoce-nestjs-toolkit/core`).
 */
export interface IJwtPayload {
  sub: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

/**
 * Usuario autenticado disponible en `request.user` una vez validado el
 * access token. Mismo shape que `IJwtPayload` con `sub` renombrado a `id`
 * para no filtrar el nombre de campo JWT hacia el resto de la app.
 */
export interface IAuthenticatedUser {
  id: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Algoritmos HMAC soportados (el secreto es compartido, no un par de claves). */
export type AuthJwtAlgorithm = 'HS256' | 'HS384' | 'HS512';

export interface AuthModuleOptions {
  /** Secreto para firmar/verificar el access token. */
  jwtSecret: string;
  /** TTL del access token, formato aceptado por `@nestjs/jwt` (ej. '15m'). Default: '15m'. */
  accessTokenTtl?: string;
  /** TTL del refresh token en segundos. Default: 7 días. */
  refreshTokenTtlSeconds?: number;
  /** Algoritmo con el que se firma y el único aceptado al verificar. Default: 'HS256'. */
  algorithm?: AuthJwtAlgorithm;
}

/**
 * Opciones para `AuthModule.registerAsync`, por ejemplo para leer el secreto desde
 * `ConfigService` en lugar de pasarlo como valor fijo.
 */
export interface AuthModuleAsyncOptions {
  imports?: ModuleMetadata['imports'];
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  useFactory: (...args: any[]) => AuthModuleOptions | Promise<AuthModuleOptions>;
}
