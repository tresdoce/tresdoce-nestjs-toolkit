<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Auth</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/auth.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Provee autenticación JWT lista para usar:

- `JwtStrategy` (passport-jwt) que valida el header `Authorization: Bearer <token>` y puebla `request.user`.
- `JwtAuthGuard` registrado como guard global (`APP_GUARD`) que respeta `@Public()` de
  [`@tresdoce-nestjs-toolkit/core`](../core/README.md).
- `TokenService` para emitir access tokens y refresh tokens opacos de un solo uso, persistidos en Redis
  vía [`@tresdoce-nestjs-toolkit/redis`](../redis/README.md), con rotación y revocación (puntual o por usuario).
- Decorador `@CurrentUser()` para leer el usuario autenticado.

Usalo cuando tu API emite sus propios tokens (login usuario/contraseña, OTP, etc.) firmados con un secreto
compartido (HMAC: `HS256`, `HS384` o `HS512`). Si los tokens los emite un IdP externo con claves asimétricas
(RS256/ES256, JWKS), este paquete no aplica.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [🐳 Redis local con Docker](#docker)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📨 Ejemplos de respuestas](#responses)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Redis 5.0 or higher (persistencia de refresh tokens)
- Proyecto ESM (`"type": "module"`): el paquete se publica solo como ESM.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/auth @tresdoce-nestjs-toolkit/redis
```

```
yarn add @tresdoce-nestjs-toolkit/auth @tresdoce-nestjs-toolkit/redis
```

### 📦 Dependencias internas

- `@tresdoce-nestjs-toolkit/core`: `@Public()` / `IS_PUBLIC_KEY` (y `@Roles()` / `RolesGuard` si los usás).
- `@tresdoce-nestjs-toolkit/redis`: `TokenService` inyecta `RedisService`. `RedisModule` es `@Global()` y
  **debe estar importado en la aplicación** (`RedisModule` leyendo `config.redis`, o `RedisModule.register(...)`);
  `AuthModule` no lo importa por sí mismo.

<a name="docker"></a>

## 🐳 Redis local con Docker

Para desarrollo local alcanza con un Redis con contraseña:

```yaml
# ./docker-compose.yml
services:
  redis:
    image: redis:7.4-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456']
```

```bash
docker compose up -d redis
```

<a name="configurations"></a>

## ⚙️ Configuración

`AuthModule` **no** lee una key fija de `ConfigService`: las opciones se pasan con `AuthModule.register(options)`
o se resuelven con `AuthModule.registerAsync({ useFactory, inject })`. Lo recomendado es guardarlas en la
configuración centralizada (por ejemplo bajo una key `auth`, admitida por la firma índice de
`Typings.AppConfig`) junto a la configuración de Redis que lee `RedisModule` (`config.redis`):

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL || '15m',
      refreshTokenTtlSeconds:
        parseInt(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS, 10) || 60 * 60 * 24 * 7,
      algorithm: 'HS256',
    },
    //...
  };
});
```

```dotenv
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=123456
JWT_SECRET=un-secreto-largo-y-aleatorio
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL_SECONDS=604800
```

> Los nombres de las variables de entorno son una convención sugerida: el paquete no lee `process.env`.
> Usá un secreto de al menos 32 bytes aleatorios (por ejemplo `openssl rand -base64 48`).

<details>
<summary>💬 Para ver en detalle todas las propiedades de <code>AuthModuleOptions</code>, hace clic acá.</summary>

`jwtSecret`: Secreto usado para firmar y verificar el access token.

- Type: `String`
- Required: `true`

`accessTokenTtl`: Tiempo de vida del access token, en formato aceptado por `jsonwebtoken`/`ms` (ej. `'15m'`, `'1h'`, `'7d'`).

- Type: `String`
- Required: `false`
- Default: `'15m'`

`refreshTokenTtlSeconds`: Tiempo de vida del refresh token en Redis, en segundos.

- Type: `Number`
- Required: `false`
- Default: `604800` (7 días)

`algorithm`: Algoritmo HMAC con el que se firma el access token. Es también el **único** algoritmo que
acepta `JwtStrategy` al verificar (evita ataques de confusión de algoritmo).

- Type: `'HS256' | 'HS384' | 'HS512'`
- Required: `false`
- Default: `'HS256'`

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule, type AuthModuleOptions } from '@tresdoce-nestjs-toolkit/auth';
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    RedisModule, // lee `config.redis`; es global y lo necesita TokenService
    AuthModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<AuthModuleOptions>('config.auth'),
    }),
    //...
  ],
})
export class AppModule {}
```

Con opciones fijas (por ejemplo en tests):

```typescript
import { AuthModule } from '@tresdoce-nestjs-toolkit/auth';
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

@Module({
  imports: [
    RedisModule.register({ host: 'localhost', port: 6379, password: '123456' }),
    AuthModule.register({
      jwtSecret: 'test-secret',
      accessTokenTtl: '15m',
      refreshTokenTtlSeconds: 60 * 60 * 24 * 7,
      algorithm: 'HS512',
    }),
  ],
})
export class AppModule {}
```

### Rutas protegidas por defecto y `@Public()`

`AuthModule` registra `JwtAuthGuard` como `APP_GUARD`: **todas** las rutas de la aplicación quedan protegidas
y requieren un access token válido en `Authorization: Bearer <token>`. Para exponer una ruta pública, usá
`@Public()` de `@tresdoce-nestjs-toolkit/core` (a nivel de handler o de controller):

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '@tresdoce-nestjs-toolkit/core';

@Controller('status')
export class StatusController {
  @Public()
  @Get()
  status() {
    return { status: 'ok' };
  }
}
```

> Si usás `HealthModule`, `ArchetypeModule` u otros endpoints del toolkit que deban ser públicos, verificá que
> estén marcados con `@Public()`.

### Login, refresh y logout con `TokenService`

```typescript
//./src/auth/auth.controller.ts
import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { Public } from '@tresdoce-nestjs-toolkit/core';
import { CurrentUser, TokenService, type IAuthTokens } from '@tresdoce-nestjs-toolkit/auth';

import { UsersService } from '../users/users.service.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: { email: string; password: string }): Promise<IAuthTokens> {
    const user = await this.usersService.validateCredentials(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return this.tokenService.generateTokens({ id: user.id, email: user.email, roles: user.roles });
  }

  // El refresh token es de un solo uso: al canjearlo se invalida y se emite un par nuevo.
  @Public()
  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string): Promise<IAuthTokens> {
    return this.tokenService.refreshTokens(refreshToken);
  }

  @HttpCode(204)
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  // Ej.: "cerrar sesión en todos los dispositivos", cambio de contraseña, baneo.
  @HttpCode(204)
  @Post('logout-all')
  async logoutAll(@CurrentUser('id') userId: string): Promise<void> {
    await this.tokenService.revokeAllForUser(userId);
  }
}
```

> Revocar refresh tokens no invalida los access tokens ya emitidos: siguen siendo válidos hasta que expiran
> (`accessTokenTtl`). Por eso conviene mantener ese TTL corto.

### Leer el usuario autenticado con `@CurrentUser()`

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, type IAuthenticatedUser } from '@tresdoce-nestjs-toolkit/auth';

@Controller('profile')
export class ProfileController {
  @Get('me')
  me(@CurrentUser() user: IAuthenticatedUser) {
    return user;
  }

  @Get('me/id')
  myId(@CurrentUser('id') id: string) {
    return { id };
  }
}
```

### Combinación con `@Roles()`

`JwtStrategy` deja `roles` en `request.user`, así que `RolesGuard` de `@tresdoce-nestjs-toolkit/core` funciona
sin configuración adicional (corre después de `JwtAuthGuard`, que es global):

```typescript
import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard } from '@tresdoce-nestjs-toolkit/core';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    //...
  }
}
```

### Testing de controllers protegidos

Como `JwtAuthGuard` está registrado como `APP_GUARD`, en tests e2e podés pedir un token real con
`TokenService.generateTokens(...)` (con Redis levantado), o sobreescribir el guard:

```typescript
import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from '@tresdoce-nestjs-toolkit/auth';

const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
  .overrideGuard(JwtAuthGuard)
  .useValue({ canActivate: () => true })
  .compile();
```

<a name="responses"></a>

## 📨 Ejemplos de respuestas

`POST /auth/login` y `POST /auth/refresh` (`IAuthTokens`):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJlbWFpbCI6InVzZXJAdGVzdC5jb20iLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3NjE0MzY4MDAsImV4cCI6MTc2MTQzNzcwMH0.<firma>",
  "refreshToken": "3b241101-e2bb-4255-8caf-4136c566a962"
}
```

Payload decodificado del access token (`IJwtPayload` + claims estándar):

```json
{
  "sub": "user-1",
  "email": "user@test.com",
  "roles": ["admin"],
  "iat": 1761436800,
  "exp": 1761437700
}
```

`GET /profile/me` (`request.user`, `IAuthenticatedUser`; `sub` se expone como `id` y se conservan los claims extra):

```json
{
  "id": "user-1",
  "email": "user@test.com",
  "roles": ["admin"],
  "iat": 1761436800,
  "exp": 1761437700
}
```

Request sin token, con token vencido, firmado con otro secreto/algoritmo o sin `sub`
(respuesta por defecto de Nest; si usás `ExceptionsFilter` de `@tresdoce-nestjs-toolkit/filters` el formato cambia):

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

`POST /auth/refresh` con un refresh token inexistente, vencido, revocado o ya canjeado:

```json
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

Keys que `TokenService` guarda en Redis:

```text
auth:refresh:3b241101-e2bb-4255-8caf-4136c566a962  -> {"userId":"user-1","email":"user@test.com","roles":["admin"]}  (TTL refreshTokenTtlSeconds)
auth:refresh:user:user-1                           -> SET { "3b241101-e2bb-4255-8caf-4136c566a962", ... }        (TTL refreshTokenTtlSeconds, se renueva en cada emisión)
```

<a name="api-reference"></a>

## 📖 API Reference

### Exports

| Export                                             | Tipo       | Descripción                                                                         |
| -------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| `AuthModule`                                       | Módulo     | `register()` / `registerAsync()`                                                    |
| `TokenService`                                     | Servicio   | Emisión, rotación y revocación de tokens                                            |
| `JwtAuthGuard`                                     | Guard      | `AuthGuard('jwt')` que respeta `@Public()`. Registrado como `APP_GUARD` y exportado |
| `JwtStrategy`                                      | Estrategia | Estrategia `jwt` de Passport                                                        |
| `CurrentUser`                                      | Decorador  | Inyecta `request.user` o uno de sus campos                                          |
| `IJwtPayload`, `IAuthenticatedUser`, `IAuthTokens` | Interfaces | Ver abajo                                                                           |
| `AuthModuleOptions`, `AuthModuleAsyncOptions`      | Interfaces | Opciones del módulo                                                                 |
| `AuthJwtAlgorithm`                                 | Tipo       | `'HS256' \| 'HS384' \| 'HS512'`                                                     |
| `AUTH_MODULE_OPTIONS`, `REFRESH_TOKEN_PREFIX`, ... | Constantes | Ver abajo                                                                           |

### `AuthModule`

| Método                                                      | Descripción                                                                                                                                                 |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AuthModule.register(options: AuthModuleOptions)`           | Registra `PassportModule`, `JwtModule`, `JwtStrategy`, `TokenService` y `JwtAuthGuard` (también como `APP_GUARD`). Exporta `TokenService` y `JwtAuthGuard`. |
| `AuthModule.registerAsync(options: AuthModuleAsyncOptions)` | Igual que `register`, pero resuelve las opciones con `useFactory` (+ `inject` / `imports`). La factory se invoca una sola vez.                              |

### `TokenService`

| Método               | Firma                                                      | Descripción                                                                                                              |
| -------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `generateTokens`     | `(user: IAuthenticatedUser) => Promise<IAuthTokens>`       | Firma un access token (`sub`, `email`, `roles`) y crea un refresh token (UUID v4) en Redis                               |
| `refreshTokens`      | `(refreshToken: string) => Promise<IAuthTokens>`           | Canjea un refresh token vigente (uso único, seguro ante canjes concurrentes) y emite un par nuevo. `401` si no es válido |
| `revokeRefreshToken` | `(refreshToken: string, userId?: string) => Promise<void>` | Revoca un refresh token puntual. Si no se pasa `userId`, se busca el dueño en Redis                                      |
| `revokeAllForUser`   | `(userId: string) => Promise<void>`                        | Revoca todos los refresh tokens vigentes de un usuario                                                                   |

### `JwtStrategy` / `JwtAuthGuard`

`JwtStrategy` extrae el bearer token (`ExtractJwt.fromAuthHeaderAsBearerToken()`), lo verifica contra `jwtSecret`
aceptando solo `algorithm`, rechaza tokens vencidos y payloads sin `sub`, y mapea el payload a `IAuthenticatedUser`
(`sub` → `id`). Los claims extra se conservan, pero no pueden pisar `id`, `email` ni `roles`.

`JwtAuthGuard` extiende `AuthGuard('jwt')` de `@nestjs/passport` y omite la validación cuando el handler o el
controller tienen `@Public()` (`IS_PUBLIC_KEY`).

### `CurrentUser`

Decorador de parámetro: `@CurrentUser()` devuelve el `IAuthenticatedUser` completo (o `undefined` en rutas
públicas sin token); `@CurrentUser('id')` devuelve solo ese campo.

### Interfaces

| Interfaz                 | Descripción                                                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IJwtPayload`            | Payload firmado en el access token (`sub`, `email?`, `roles?`, claims extra)                                                                                                  |
| `IAuthenticatedUser`     | Shape de `request.user` (`id`, `email?`, `roles?`, campos extra)                                                                                                              |
| `IAuthTokens`            | `{ accessToken: string; refreshToken: string }`                                                                                                                               |
| `AuthModuleOptions`      | `{ jwtSecret: string; accessTokenTtl?: string; refreshTokenTtlSeconds?: number; algorithm?: AuthJwtAlgorithm }`                                                               |
| `AuthModuleAsyncOptions` | `{ imports?: ModuleMetadata['imports']; inject?: (InjectionToken \| OptionalFactoryDependency)[]; useFactory: (...args) => AuthModuleOptions \| Promise<AuthModuleOptions> }` |

### Constantes exportadas

| Constante                         | Valor                   | Descripción                                                 |
| --------------------------------- | ----------------------- | ----------------------------------------------------------- |
| `AUTH_MODULE_OPTIONS`             | `'AUTH_MODULE_OPTIONS'` | Token de inyección de las opciones del módulo               |
| `REFRESH_TOKEN_PREFIX`            | `'auth:refresh'`        | Prefijo de la key de Redis de cada refresh token            |
| `REFRESH_TOKEN_USER_INDEX_PREFIX` | `'auth:refresh:user'`   | Prefijo de la key de Redis del índice de tokens por usuario |
| `DEFAULT_ACCESS_TOKEN_TTL`        | `'15m'`                 | TTL por defecto del access token                            |
| `DEFAULT_JWT_ALGORITHM`           | `'HS256'`               | Algoritmo por defecto                                       |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
