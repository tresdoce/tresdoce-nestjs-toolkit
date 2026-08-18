<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Auth</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/auth.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Provee autenticación JWT lista para usar: estrategia y guard de Passport, decorador `@CurrentUser()`, y un
`TokenService` con emisión y rotación de refresh tokens persistidos en Redis. Se integra directamente con
`@Public()` y `@Roles()` de [`@tresdoce-nestjs-toolkit/core`](../core/README.md).

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.21.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v11.1.11 or higher ([Documentación](https://nestjs.com/))
- Redis 5.0 or higher (persistencia de refresh tokens)

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/auth
```

```
yarn add @tresdoce-nestjs-toolkit/auth
```

## 📦 Dependencias internas

Este paquete usa `@tresdoce-nestjs-toolkit/core` (para `@Public()`/`@Roles()`/`IS_PUBLIC_KEY`) y
`@tresdoce-nestjs-toolkit/redis` (para persistir los refresh tokens). El `RedisModule` debe estar
registrado en la aplicación —típicamente vía `RedisModule.register(...)` o configuración centralizada
en `app.module.ts`— antes de importar `AuthModule`, ya que `TokenService` depende de `RedisService`.

<a name="configurations"></a>

## ⚙️ Configuración

`AuthModule` se registra con `AuthModule.register(options)`, sin depender de `ConfigService`, para
mantener explícito de dónde sale el secreto de firma:

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    auth: {
      jwtSecret: process.env.JWT_SECRET,
      accessTokenTtl: process.env.JWT_ACCESS_TOKEN_TTL || '15m',
      refreshTokenTtlSeconds:
        parseInt(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS, 10) || 60 * 60 * 24 * 7,
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de <code>AuthModuleOptions</code>, hace clic acá.</summary>

`jwtSecret`: Secreto usado para firmar y verificar el access token.

- Type: `String`
- Required: `true`

`accessTokenTtl`: Tiempo de vida del access token, en formato aceptado por `@nestjs/jwt` (ej. `'15m'`, `'1h'`).

- Type: `String`
- Required: `false`
- Default: `'15m'`

`refreshTokenTtlSeconds`: Tiempo de vida del refresh token, en segundos.

- Type: `Number`
- Required: `false`
- Default: `604800` (7 días)

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo

```typescript
//./src/app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@tresdoce-nestjs-toolkit/auth';
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

@Module({
  imports: [
    //...
    RedisModule, // debe registrarse antes que AuthModule
    AuthModule.register({
      jwtSecret: process.env.JWT_SECRET,
      accessTokenTtl: '15m',
      refreshTokenTtlSeconds: 60 * 60 * 24 * 7,
    }),
    //...
  ],
})
export class AppModule {}
```

`AuthModule` registra `JwtAuthGuard` como `APP_GUARD`: todas las rutas quedan protegidas por defecto y
requieren un access token válido en el header `Authorization: Bearer <token>`. Para exponer una ruta
pública, usar `@Public()` de `@tresdoce-nestjs-toolkit/core`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public } from '@tresdoce-nestjs-toolkit/core';

@Controller('auth')
export class AuthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
```

### Emitir tokens (login)

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@tresdoce-nestjs-toolkit/core';
import { TokenService } from '@tresdoce-nestjs-toolkit/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.usersService.validateCredentials(dto);
    return this.tokenService.generateTokens({ id: user.id, email: user.email, roles: user.roles });
  }
}
```

### Rotar el refresh token

El refresh token es de un solo uso: al canjearlo se invalida y se emite un par nuevo.

```typescript
@Public()
@Post('refresh')
async refresh(@Body('refreshToken') refreshToken: string) {
  return this.tokenService.refreshTokens(refreshToken);
}
```

### Logout / revocación

```typescript
@Post('logout')
async logout(@Body('refreshToken') refreshToken: string) {
  await this.tokenService.revokeRefreshToken(refreshToken);
}

@Post('logout-all')
async logoutAll(@CurrentUser('id') userId: string) {
  await this.tokenService.revokeAllForUser(userId);
}
```

### Leer el usuario autenticado con `@CurrentUser()`

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, IAuthenticatedUser } from '@tresdoce-nestjs-toolkit/auth';

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

`request.user.roles` queda poblado por `JwtStrategy`, por lo que `RolesGuard` de
`@tresdoce-nestjs-toolkit/core` funciona sin configuración adicional:

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

<a name="api-reference"></a>

## 📖 API Reference

### `AuthModule`

| Método                                            | Descripción                                                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `AuthModule.register(options: AuthModuleOptions)` | Inicialización estática. Registra `PassportModule`, `JwtModule`, `JwtStrategy`, `TokenService` y `JwtAuthGuard` (como `APP_GUARD`). |

### `TokenService`

| Método               | Firma                                                      | Descripción                                                            |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `generateTokens`     | `(user: IAuthenticatedUser) => Promise<IAuthTokens>`       | Emite un nuevo par access/refresh token y persiste el refresh en Redis |
| `refreshTokens`      | `(refreshToken: string) => Promise<IAuthTokens>`           | Rota un refresh token vigente (uso único) y emite un par nuevo         |
| `revokeRefreshToken` | `(refreshToken: string, userId?: string) => Promise<void>` | Revoca un refresh token puntual                                        |
| `revokeAllForUser`   | `(userId: string) => Promise<void>`                        | Revoca todos los refresh tokens vigentes de un usuario                 |

### `JwtStrategy` / `JwtAuthGuard`

`JwtStrategy` extrae el bearer token, lo verifica contra `jwtSecret` y mapea el payload a
`IAuthenticatedUser` (`sub` → `id`), quedando disponible en `request.user`.

`JwtAuthGuard` extiende `AuthGuard('jwt')` de Passport y respeta `@Public()`: las rutas marcadas
como públicas omiten la validación del token.

### `CurrentUser`

Decorador de parámetro. Sin argumentos devuelve el `IAuthenticatedUser` completo; con una key
(`@CurrentUser('id')`) devuelve solo ese campo.

### Interfaces

| Interfaz             | Descripción                                                                  |
| -------------------- | ---------------------------------------------------------------------------- |
| `IJwtPayload`        | Payload firmado en el access token (`sub`, `email?`, `roles?`, claims extra) |
| `IAuthenticatedUser` | Shape de `request.user` (`id`, `email?`, `roles?`, campos extra)             |
| `IAuthTokens`        | `{ accessToken: string; refreshToken: string }`                              |
| `AuthModuleOptions`  | Opciones de `AuthModule.register()`                                          |

### Constantes exportadas

| Constante                         | Descripción                                                          |
| --------------------------------- | -------------------------------------------------------------------- |
| `AUTH_MODULE_OPTIONS`             | Token de inyección de las opciones del módulo                        |
| `REFRESH_TOKEN_PREFIX`            | Prefijo de la key de Redis usada para persistir cada refresh token   |
| `REFRESH_TOKEN_USER_INDEX_PREFIX` | Prefijo de la key de Redis usada para indexar los tokens por usuario |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
