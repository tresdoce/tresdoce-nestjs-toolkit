<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Core</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/core.svg">
    <br/>
</div>
<br/>

Módulo central del toolkit que provee tipos, helpers, decoradores, guards y utilidades que son utilizados transversalmente por los demás paquetes. Está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter) o en cualquier proyecto que siga la misma arquitectura de configuración centralizada.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
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

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/core
```

```
yarn add @tresdoce-nestjs-toolkit/core
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit en runtime. El namespace `Typings` referencia (solo como tipos, con `import type`) las opciones de los demás paquetes (`redis`, `typeorm`, `logger`, etc.) para modelar `Typings.AppConfig`.

Las DTOs/entities usan `@nestjs/swagger` y `@nestjs/class-validator`, y el middleware CSRF lee `req.cookies`/`req.signedCookies`, por lo que la app tiene que registrar [`cookie-parser`](https://www.npmjs.com/package/cookie-parser).

No necesita servicios externos (Redis, bases de datos, etc.), así que no hace falta `docker-compose` para usarlo.

> **ESM + decoradores**: el paquete es ESM-only. Los tipos que se usan en parámetros decorados (`PaginationParams`, `SortCriteria`, `Filtering`, `ICsrfRequest`, `Typings`) se importan con `import type` (o `{ type X }`); con `isolatedModules` + `emitDecoratorMetadata` TypeScript lo exige (TS1272).

<a name="use"></a>

## 👨‍💻 Uso

### Typings — Configuración centralizada

El namespace `Typings` expone todas las interfaces y enums que modelan la configuración centralizada de la aplicación (`config`).

```typescript
// ./src/config/configuration.ts
import { getSkipHealthChecks, type Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    project: {
      apiPrefix: process.env.API_PREFIX,
      name: process.env.npm_package_name,
      version: process.env.npm_package_version,
      description: process.env.npm_package_description,
      author: {
        name: process.env.npm_package_author_name,
        email: process.env.npm_package_author_email,
        url: process.env.npm_package_author_url,
      },
      repository: {
        type: 'git',
        url: process.env.npm_package_repository_url,
      },
      bugs: {
        url: process.env.npm_package_bugs_url,
      },
      homepage: process.env.npm_package_homepage,
    },
    server: {
      isProd: process.env.NODE_ENV === 'production',
      appStage: process.env.APP_STAGE as Typings.TAppStage,
      port: parseInt(process.env.PORT, 10) || 8080,
      context: process.env.CONTEXT,
      origins: process.env.ORIGINS.split(','),
      allowedHeaders: process.env.ALLOWED_HEADERS,
      allowedMethods: process.env.ALLOWED_METHODS,
      corsEnabled: process.env.CORS_ENABLED === 'true',
      corsCredentials: process.env.CORS_CREDENTIALS === 'true',
      propagateHeaders: process.env.PROPAGATE_HEADERS
        ? process.env.PROPAGATE_HEADERS.split(',')
        : [],
    },
    swagger: {
      path: process.env.SWAGGER_PATH,
      enabled: process.env.SWAGGER_ENABLED === 'true',
    },
    health: {
      skipChecks: getSkipHealthChecks(process.env.SKIP_HEALTH_CHECKS),
    },
  };
});
```

`project`, `server` y `swagger` son obligatorias; el resto de las keys (`redis`, `database`, `logger`, `kafka`, …) son opcionales y cada paquete del toolkit lee la suya con `configService.get('config.<key>')`. `getSkipHealthChecks` (también de este paquete) convierte `'storage, memory'` en `['storage', 'memory']`.

Para leer la configuración desde un servicio:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getServer(): Typings.IServerConfig {
    return this.configService.get<Typings.AppConfig>('config').server;
  }
}
```

---

### Validation Schema

La función `validateSchemaForApp` genera un schema **Zod** que combina las validaciones base obligatorias del starter con las validaciones custom del proyecto. `@nestjs/config` 12 acepta cualquier Standard Schema en `validationSchema`, así que se pasa directo:

```typescript
// ./src/config/validationSchema.ts
import { z } from 'zod';
import { validateSchemaForApp } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  // Parámetros custom de la aplicación
  RICK_AND_MORTY_API_URL: z.url(),
});

// ./src/app.module.ts
ConfigModule.forRoot({ isGlobal: true, load: [config], validationSchema });
```

Si la aplicación implementa CSRF, también hay que extender con `validationSchemaCsrf`:

```typescript
// ./src/config/validationSchema.ts
import { z } from 'zod';
import { validateSchemaForApp, validationSchemaCsrf } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  ...validationSchemaCsrf,
  // Parámetros custom adicionales
  RICK_AND_MORTY_API_URL: z.url(),
});
```

Las variables de entorno siempre llegan como string. Para booleanos y números usá los helpers:

- `zBooleanFromEnv()`: acepta `true`/`false` o `'true'`/`'false'`. Ojo: `z.coerce.boolean()` convierte `'false'` en `true`.
- `zNumberFromEnv()`: acepta `8080` o `'8080'`.

Otros exports: `baseValidationSchema` y `baseValidationSchemaApp` (shapes para combinar con spread) y `validateSchema(schema, input)`, que valida y lanza un único `Error` con todos los problemas.

<details>
<summary>💬 Variables de entorno de <code>baseValidationSchemaApp</code></summary>

| Variable                                                            | Requerida | Tipo                                                             |
| ------------------------------------------------------------------- | --------- | ---------------------------------------------------------------- |
| `NODE_ENV`, `API_PREFIX`, `CONTEXT`, `ORIGINS`                      | ✅        | `string`                                                         |
| `ALLOWED_HEADERS`, `ALLOWED_METHODS`, `SWAGGER_PATH`                | ✅        | `string`                                                         |
| `APP_STAGE`                                                         | ✅        | `local \| test \| snd \| dev \| qa \| homo \| prod`              |
| `PORT`                                                              | ✅        | número (`zNumberFromEnv`)                                        |
| `CORS_ENABLED`, `CORS_CREDENTIALS`, `SWAGGER_ENABLED`               | ✅        | booleano (`zBooleanFromEnv`)                                     |
| `EXPOSED_HEADERS`, `PROPAGATE_HEADERS`, `HEALTH_CHECK_STORAGE_PATH` | ❌        | `string`                                                         |
| `SKIP_HEALTH_CHECKS`                                                | ❌        | CSV de `storage, memory, elasticsearch, camunda, typeorm, redis` |
| `HEALTH_CHECK_STORAGE_THRESHOLD(_PERCENT)`, `HEALTH_CHECK_MEMORY_*` | ❌        | número                                                           |
| `TRACING_ENDPOINT`, `TRACING_AUTH_TOKEN`, `TRACING_IGNORE_PATHS`    | ❌        | `string`                                                         |
| `CSRF_SECRET` (con `validationSchemaCsrf`)                          | solo prod | `string` de 32 caracteres                                        |

</details>

Ejemplo del error que lanza `validateSchema` (un único `Error` con todos los problemas):

```text
"PORT": Invalid input: expected number, received NaN. "API_PREFIX": Invalid input: expected string, received undefined. "CORS_CREDENTIALS": Invalid input: expected boolean, received undefined
```

> **Joi (obsoleto)**: las versiones anteriores siguen disponibles con sufijo `Joi` (`validateSchemaForAppJoi`, `baseValidationSchemaAppJoi`, `validationSchemaCsrfJoi`, `validateSchemaJoi`) para migrar de a poco. Joi 18 también implementa Standard Schema, así que funcionan con `@nestjs/config` 12. Se van a quitar en una próxima major.

> **Regla de validación de `CSRF_SECRET`**: En entornos `prod` es obligatorio y debe ser una cadena de exactamente **32 caracteres** que incluya al menos una minúscula, una mayúscula, un dígito y un carácter especial (`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{32}$`). En otros entornos es opcional.

---

### corePathsExcludes

Retorna un array de objetos `{ path, method }` que representa las rutas core que deben excluirse del prefix global y de funcionalidades como logging.

```typescript
// ./src/main.ts
import { corePathsExcludes } from '@tresdoce-nestjs-toolkit/core';

async function bootstrap() {
  //...
  app.setGlobalPrefix(`${server.context}`, {
    exclude: [...corePathsExcludes()],
  });
  //...
}
```

Las rutas excluidas son: `/health/liveness`, `/health/readiness`, `/info` y `/metrics` (con su prefijo de contexto si `CONTEXT` está definido).

### excludePaths

Versión simplificada de `corePathsExcludes()` que retorna solo los strings de path (sin el método HTTP), útil para filtros de middleware o loggers.

```typescript
import { excludePaths } from '@tresdoce-nestjs-toolkit/core';

// Retorna: ['/api/health/liveness', '/api/health/readiness', '/api/info', '/api/metrics']
const paths = excludePaths();
```

### corePathsExcludesGlobs

Array estático de patrones glob equivalentes a las rutas core excluidas. Útil para configurar middlewares que aceptan globs (e.g., morgan, winston).

```typescript
import { corePathsExcludesGlobs } from '@tresdoce-nestjs-toolkit/core';

// ['**/health/liveness', '**/health/readiness', '**/info', '**/metrics']
console.log(corePathsExcludesGlobs);
```

---

### setHttpsOptions

Configura las opciones HTTPS para la aplicación NestJS leyendo el certificado y la clave privada desde el filesystem.

```typescript
// ./src/main.ts
import { setHttpsOptions } from '@tresdoce-nestjs-toolkit/core';

const certPath = './secrets/public-certificate.pem';
const keyPath = './secrets/private-key.pem';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: setHttpsOptions(certPath, keyPath),
  });
  //...
}
```

Si alguno de los archivos no existe, retorna `{ cert: '', key: '' }` sin lanzar error.

---

## Cross-site request forgery (CSRF)

Cross-Site Request Forgery (**CSRF**) es un tipo de ataque de seguridad que ocurre cuando un atacante engaña a un usuario autenticado para que realice acciones no deseadas en una aplicación web. El middleware de protección genera y valida tokens CSRF únicos asociados a la sesión del usuario. Si el token no está presente o es inválido, la solicitud es rechazada con HTTP `403 Forbidden`.

### Configuración

El CSRF funciona utilizando cookies y requiere `CSRF_SECRET` en las variables de entorno. La configuración se integra en la configuración centralizada de la app:

```typescript
// ./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      csrf: {
        secret: process.env.CSRF_SECRET,
        // Propiedades opcionales — los defaults están documentados abajo
      },
    },
    //...
  };
});
```

Y en el schema de validación:

```typescript
// ./src/config/validationSchema.ts
import { validateSchemaForApp, validationSchemaCsrf } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  ...validationSchemaCsrf,
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`key`: Nombre de la cookie que almacena el secreto de sesión CSRF.

- Type: `String`
- Default: `_csrf`
- Example: `csrf_key`

`cookieName`: Nombre de la cookie que contiene el token CSRF enviado al cliente.

- Type: `String`
- Default: `xsrf-token`
- Example: `token-xsrf`

`secret`: Frase secreta utilizada para firmar el token CSRF. En entornos `prod` debe tener exactamente 32 caracteres con mayúsculas, minúsculas, dígitos y caracteres especiales.

- Type: `String`
- Default: `''`
- Example: `9r@F5z!X8w*L3q&H2s^J7p#K1n$Y4m?A`

`sameSite`: Atributo SameSite de la cookie CSRF.

- Type: `String`
- Values: `strict | lax | none`
- Default: `strict`

`httpOnly`: Indica si la cookie no es accesible desde JavaScript del navegador.

- Type: `Boolean`
- Default: `true`

`signed`: Indica si la cookie debe estar firmada con el `secret`.

- Type: `Boolean`
- Default: `true`

`path`: Ruta para la que es válida la cookie.

- Type: `String`
- Default: `/`

`secure`: Si es `true`, la cookie solo se envía por HTTPS. Por defecto vale `true` cuando `NODE_ENV === 'production'` (se evalúa al cargar el módulo).

- Type: `Boolean`
- Default: `false` (en local/test), `true` (en production)

`maxAge`: Tiempo de vida de la cookie en segundos.

- Type: `Number`
- Default: `300` (5 minutos)

También se aceptan `domain`, `expires`, `partitioned` y `priority`. Las opciones propias del middleware (`key`, `cookieName`, `secret`, `signed`) no se escriben en la cookie.

</details>

### Implementación del middleware

```typescript
// ./src/main.ts
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { csrfToken, type Typings } from '@tresdoce-nestjs-toolkit/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(ConfigService).get<Typings.AppConfig>('config');
  //...
  app.use([
    cookieParser(appConfig.server.csrf.secret),
    csrfToken(appConfig.server.csrf),
    //...
  ]);
  //...
}
void bootstrap();
```

> `cookieParser` tiene que registrarse **antes** que `csrfToken`, con el mismo secreto, para que existan `req.signedCookies` (cookies firmadas, default) o `req.cookies`. Si `CsrfGuard` se ejecuta sin que el middleware haya corrido, lanza `500 Internal Server Error` con el mensaje `CSRF middleware is not configured...` en lugar de fallar con un `TypeError`.

Cabeceras que setea el middleware en la respuesta (secreto de sesión y, al llamar a `req.csrfToken()`, el token):

```text
Set-Cookie: _csrf=s%3A<secreto-firmado>; Max-Age=300; Path=/; HttpOnly; SameSite=Strict
Set-Cookie: xsrf-token=s%3A<token-firmado>; Max-Age=300; Path=/; HttpOnly; SameSite=Strict
```

### Decorador `@Csrf()`

Protege un endpoint o un controller completo aplicando el `CsrfGuard`. Al decorar un controller, protege todos sus endpoints.

#### Nivel controller

```typescript
import { Csrf } from '@tresdoce-nestjs-toolkit/core';

@Csrf()
export class MyController {
  @Get()
  async myEndpoint() {
    /*...*/
  }

  @Get('endpoint2')
  async myEndpoint2() {
    /*...*/
  }
}
```

#### Nivel endpoint

```typescript
import { Csrf } from '@tresdoce-nestjs-toolkit/core';

export class MyController {
  @Get()
  @Csrf()
  async myEndpoint() {
    /*...*/
  }
}
```

> En entornos `test` (`NODE_ENV === 'test'`), `@Csrf()` aplica el metadata `skipCsrfGuard: true` en lugar del guard, permitiendo ejecutar tests sin cookies CSRF.

### Iniciar el token CSRF de sesión

El primer request debe generar el token de sesión llamando a `req.csrfToken()`. El lugar adecuado suele ser el endpoint de login o el primer endpoint público de la aplicación.

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import type { ICsrfRequest } from '@tresdoce-nestjs-toolkit/core';

@Controller('auth')
export class AuthController {
  @Get('/login')
  async login(@Req() req: ICsrfRequest) {
    req.csrfToken(); // Genera y setea el token de sesión en la cookie
    //...
  }
}
```

A partir de ese punto, cada request válido que pase por `CsrfGuard` llama a `req.csrfToken()`, que setea la cookie del token si todavía no se generó en ese request.

`CsrfGuard` valida, en este orden: que existan secreto y token, que el User-Agent y la IP (primer valor de `x-forwarded-for`, o `req.ip`) coincidan con los que quedaron codificados en el secreto, y que el token sea válido. Respuestas posibles (formato por defecto de Nest; con `@tresdoce-nestjs-toolkit/filters` se envuelven en su propio formato):

```json
{ "statusCode": 403, "message": "CSRF token not found" }
```

```json
{ "statusCode": 403, "message": "Invalid device" }
```

```json
{ "statusCode": 403, "message": "Invalid IP device" }
```

```json
{ "statusCode": 403, "message": "Invalid CSRF Token" }
```

### Consideraciones

- Agregar `Access-Control-Allow-Credentials` a la lista `ALLOWED_HEADERS` en las variables de entorno.
- Configurar `CORS_CREDENTIALS=true` en las variables de entorno.
- Si utilizas `Axios`, configurar las instancias con `withCredentials: true`.
- Verificar que el navegador o herramienta de testing permita la configuración de cookies.

---

## Decorators

### `@Public()`

Marca un endpoint o controller como público (no requiere autenticación). Setea el metadata `isPublic: true`, leído por `RolesGuard` (ver sección [Roles y autorización](#roles-y-autorización)) para omitir la verificación de roles.

```typescript
import { Public } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class AppController {
  @Get('')
  @Public()
  getInfo(): string {
    return 'endpoint público';
  }

  @Get('private')
  getPrivate() {
    return 'endpoint privado';
  }
}
```

### `@Roles(...roles)`

Setea metadata de roles sobre un endpoint o controller, leída por `RolesGuard` (ver sección [Roles y autorización](#roles-y-autorización)).

```typescript
import { Roles } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class AppController {
  @Get('')
  @Roles('user')
  onlyUser(): string {
    return '...';
  }

  @Get('admin')
  @Roles('user', 'admin')
  userAndAdmin(): string {
    return '...';
  }
}
```

---

## Roles y autorización

`RolesGuard` aplica el control de acceso basado en los metadata seteados por `@Roles(...roles)` y `@Public()`:

- Si el endpoint (o su controller) tiene `@Public()`, se permite el acceso sin más verificaciones.
- Si no se especificó `@Roles(...)`, se permite el acceso — la guardia no restringe por defecto, solo cuando se le pide explícitamente.
- En caso contrario, compara los roles requeridos contra los del usuario (convención estándar de NestJS/Passport: se espera que un guard de autenticación previo, como `AuthGuard('jwt')`, ya haya poblado `request.user`). Si ninguno coincide, lanza `403 Forbidden`.
- Los roles del usuario se leen de `request.user.roles` **o** `request.user.role`, como string, valor de enum o array. La comparación no distingue mayúsculas ni espacios, así que `@Roles(UserRole.Admin)` matchea con `role: 'admin'`.

Respuesta cuando el usuario no tiene ninguno de los roles requeridos (o no hay `request.user`):

```json
{ "statusCode": 403, "message": "Insufficient role" }
```

Los helpers que usa la guardia también se exportan, por si necesitás la misma lógica en un servicio o en tests:

```typescript
import { hasAnyRequiredRole, normalizeRoles } from '@tresdoce-nestjs-toolkit/core';

normalizeRoles([' Admin ', 'EDITOR']); // ['admin', 'editor']
hasAnyRequiredRole({ role: 'admin' }, ['ADMIN', 'owner']); // true
```

#### Nivel endpoint

```typescript
import { Roles, RolesGuard } from '@tresdoce-nestjs-toolkit/core';
import { UseGuards } from '@nestjs/common';

export class MyController {
  @Get('admin')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async onlyAdmin() {
    /*...*/
  }
}
```

#### Aplicado globalmente

Para exigir roles en toda la aplicación por defecto (y usar `@Public()` para las excepciones), registrá `RolesGuard` como `APP_GUARD`:

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '@tresdoce-nestjs-toolkit/core';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

### `@ExcludeFilter()`

Marca un endpoint o controller para que sea excluido de filtros globales (e.g., exception filters personalizados). Setea el metadata `excludeFilter: true`, que puede leerse con `EXCLUDE_FILTER_KEY`.

```typescript
import { ExcludeFilter } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class HealthController {
  @Get('liveness')
  @ExcludeFilter()
  liveness() {
    return { status: 'ok' };
  }
}
```

Lectura del metadata en un filtro:

```typescript
import { EXCLUDE_FILTER_KEY } from '@tresdoce-nestjs-toolkit/core';

const isExcluded = this.reflector.get<boolean>(EXCLUDE_FILTER_KEY, context.getHandler());
```

---

## Param Decorators

### `@Pagination()`

Extrae y valida los parámetros de paginación `page` y `size` del query string. Retorna un objeto `PaginationParams`.

```typescript
import { Controller, Get } from '@nestjs/common';
import { Pagination, type PaginationParams } from '@tresdoce-nestjs-toolkit/core';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@Pagination() pagination: PaginationParams) {
    const { page, size } = pagination;
    console.log('Current page: ', page);
    console.log('Items per page: ', size);
    //...
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades, hace clic acá.</summary>

`page`: Número de página actual.

- Type: `number`
- Default: `1`
- Minimum: `1`

`size`: Cantidad de elementos por página.

- Type: `number`
- Default: `10`
- Maximum: `100`

Si `page` o `size` se proveen pero no son enteros positivos válidos, se lanza `BadRequestException`. Si `size` supera `100`, también se lanza `BadRequestException`.

</details>

Valor recibido para `GET /users?page=2&size=20` → `{ "page": 2, "size": 20 }`; sin parámetros → `{ "page": 1, "size": 10 }`.

Respuesta para `GET /users?size=150`:

```json
{
  "message": "The size parameter is invalid. It must be a positive integer and cannot be more than 100.",
  "error": "Bad Request",
  "statusCode": 400
}
```

#### URL Example

- Schema: `<http|https>://<server_url><:port>/<context>/<endpoint>?page=<value>&size=<value>`
- Example: `http://localhost:8080/v1/users?page=2&size=20`

---

### `@Sorting(validFields)`

Extrae y valida el parámetro `sort` del query string. Retorna un array de `SortCriteria`.

```typescript
import { Controller, Get } from '@nestjs/common';
import { Sorting, type SortCriteria } from '@tresdoce-nestjs-toolkit/core';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@Sorting(['id', 'email', 'name']) sorting: SortCriteria[]) {
    sorting.forEach(({ field, order }) => {
      console.log(`Sort by ${field} ${order}`);
    });
    //...
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades, hace clic acá.</summary>

`field`: Nombre del campo por el cual ordenar (debe ser uno de los campos declarados en el decorador).

- Type: `string`

`order`: Dirección del ordenamiento.

- Type: `'asc' | 'desc'`
- Default: `'asc'`

Si el campo no está en la lista de campos válidos o el formato es inválido, se lanza `BadRequestException`.

</details>

#### URL Example

- Schema: `?sort=<field1>:<order1>,<field2>:<order2>`
- Example: `http://localhost:8080/v1/users?sort=id:asc,email:desc` (también se acepta repetido: `?sort=id:asc&sort=email:desc`)

Valor recibido para `?sort=id,email:desc`:

```json
[
  { "field": "id", "order": "asc" },
  { "field": "email", "order": "desc" }
]
```

Respuesta para `?sort=password:asc`:

```json
{
  "message": "The sorting property \"password\" is invalid. It should be one of the following: id, email, name.",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### `@FilteringParams(validProperties)`

Extrae y valida el parámetro `filters` del query string. Retorna un array de `Filtering`.

```typescript
import { Controller, Get } from '@nestjs/common';
import { FilteringParams, type Filtering } from '@tresdoce-nestjs-toolkit/core';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@FilteringParams(['firstName', 'email', 'age']) filters: Filtering[]) {
    filters.forEach(({ property, rule, values }) => {
      console.log(`Filter: ${property} ${rule}`, values);
    });
    //...
  }
}
```

<details>
<summary>💬 Para ver en detalle todas las propiedades, hace clic acá.</summary>

`property`: Nombre de la propiedad a filtrar (debe estar en la lista declarada).

- Type: `string`

`rule`: Regla de filtrado.

- Type: `FilterRule`
- Enum: `eq | neq | gt | gte | lt | lte | like | nlike | in | nin | isnull | isnotnull`

`values`: Valores para el filtro según la regla. Para `isnull` y `isnotnull` es un array vacío.

- Type: `(string | number | boolean)[]`

Si la propiedad, la regla o el formato son inválidos, se lanza `BadRequestException`.

</details>

#### URL Example

- Schema: `?filters=<property1>:<rule1>:<value1>,<property2>:<rule2>:<value2>`
- Example: `http://localhost:8080/v1/users?filters=age:gte:30,name:like:John,status:in:active,inactive`

Los valores se convierten según la regla: `gt/gte/lt/lte` → `number`; `eq/neq` → `number` si es numérico, si no `string`; `in/nin` → array de strings separados por coma; `isnull/isnotnull` → sin valores. Valor recibido para `?filters=age:gte:30,status:in:active,inactive,deletedAt:isnull`:

```json
[
  { "property": "age", "rule": "gte", "values": [30] },
  { "property": "status", "rule": "in", "values": ["active", "inactive"] },
  { "property": "deletedAt", "rule": "isnull", "values": [] }
]
```

Respuesta para una propiedad no permitida (`?filters=password:eq:1234`):

```json
{ "message": "Invalid filter property: password", "error": "Bad Request", "statusCode": 400 }
```

---

## Paginación con `calculatePagination`

Función utilitaria que calcula los metadatos de paginación a partir de `page`, `size` y `total`.

```typescript
import { calculatePagination } from '@tresdoce-nestjs-toolkit/core';

const meta = calculatePagination({ page: 2, size: 10, total: 100 });
// {
//   page: 2,
//   size: 10,
//   total: 100,
//   totalPages: 10,
//   hasNext: true,
//   hasPrevious: true,
// }
```

Para estructurar la respuesta paginada en Swagger, se proveen las clases `PaginationMetaData` y `PaginationResponse<T>`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import {
  calculatePagination,
  Pagination,
  PaginationResponse,
  type PaginationParams,
} from '@tresdoce-nestjs-toolkit/core';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ type: PaginationResponse })
  @Get()
  async findAll(
    @Pagination() pagination: PaginationParams,
  ): Promise<PaginationResponse<UserEntity>> {
    const [data, total] = await this.usersService.findAll(pagination);
    return {
      data,
      meta: calculatePagination({ ...pagination, total }),
    };
  }
}
```

Respuesta HTTP:

```json
{
  "data": [{ "id": 11, "email": "rick@sanchez.com" }],
  "meta": {
    "page": 2,
    "size": 10,
    "total": 30,
    "totalPages": 3,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

`PaginationResponse<T>` tiene las propiedades `data: T[]` y `meta: PaginationMetaData`.  
`PaginationMetaData` incluye: `page`, `size`, `total`, `totalPages?`, `hasNext?`, `hasPrevious?`.

---

<a name="api-reference"></a>

## 📖 API Reference

### Namespace `Typings`

| Export                                                                              | Descripción                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppConfig`                                                                         | Interface raíz de la configuración centralizada (key `'config'`). Obligatorias: `project`, `server`, `swagger`. Opcionales: `health`, `params`, `httpClient`, `services`, `database` (`typeorm` + `mongo`), `redis`, `mailer`, `camunda`, `elasticsearch`, `tracing`, `redact`, `bcrypt`, `snowflakeUID`, `sqs`, `logger`, `kafka`. |
| `IProjectConfig`                                                                    | Datos del proyecto (`apiPrefix`, `name`, `version`, `description`, `author`, `repository`, `bugs`, `homepage`).                                                                                                                                                                                                                     |
| `IServerConfig`                                                                     | Configuración del servidor (`isProd`, `appStage`, `port`, `context`, `origins`, `propagateHeaders`, `allowedHeaders`, `allowedMethods`, `corsEnabled`, `corsCredentials`, `csrf`, `rateLimits`).                                                                                                                                    |
| `IHealthConfig`                                                                     | Configuración de health checks (`skipChecks`, `storage`, `memory`).                                                                                                                                                                                                                                                                 |
| `IParamsConfig` / `IHttpClientConfig` / `IServicesConfig` / `DatabaseModuleOptions` | Tipos de `params`, `httpClient`, `services` y `database`.                                                                                                                                                                                                                                                                           |
| `ISwaggerConfig`                                                                    | Configuración de Swagger (`path`, `enabled`).                                                                                                                                                                                                                                                                                       |
| `TAppStage`                                                                         | `'local' \| 'test' \| 'snd' \| 'dev' \| 'qa' \| 'homo' \| 'prod'`                                                                                                                                                                                                                                                                   |
| `EAppStage`                                                                         | Enum equivalente a `TAppStage`.                                                                                                                                                                                                                                                                                                     |
| `TSkipHealthChecks`                                                                 | `'storage' \| 'memory' \| 'elasticsearch' \| 'camunda' \| 'typeorm' \| 'redis'`                                                                                                                                                                                                                                                     |
| `ESkipHealthChecks`                                                                 | Enum equivalente a `TSkipHealthChecks`.                                                                                                                                                                                                                                                                                             |

### Commons (rutas y CSRF)

| Export                                    | Tipo                                              | Descripción                                            |
| ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `corePathsExcludes()`                     | `() => { path: string; method: RequestMethod }[]` | Rutas core a excluir del prefix global.                |
| `excludePaths()`                          | `() => string[]`                                  | Solo los paths de `corePathsExcludes()`.               |
| `corePathsExcludesGlobs`                  | `string[]`                                        | Patrones glob de las rutas core.                       |
| `csrfToken(options?)`                     | `(options?: CsrfCookieOptions) => Middleware`     | Middleware Express que gestiona el token CSRF.         |
| `CsrfCookieOptions`                       | `interface`                                       | Opciones de configuración de la cookie CSRF.           |
| `ICsrfRequest`                            | `interface`                                       | Request extendido con `cookieConfig` y `csrfToken()`.  |
| `getCsrfFromRequest(req)`                 | `function`                                        | Extrae el token CSRF de la request.                    |
| `getSecretFromRequest(req, name, cookie)` | `function`                                        | Extrae el secreto de la request.                       |
| `verify(secret, token)`                   | `function`                                        | Verifica si un token CSRF es válido contra su secreto. |

`extractDeviceData`, `getIpAddress` y `getUserAgent` son helpers internos del guard (no se exportan desde el índice).

### Validations

| Export                                   | Tipo                  | Descripción                                                                                                                      |
| ---------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `validateSchemaForApp(shape?)`           | `function`            | Schema Zod (Standard Schema) con `baseValidationSchemaApp` + el shape custom; aplica la regla de `CSRF_SECRET` si está presente. |
| `validateSchema(schema, input)`          | `function`            | Valida un input contra un schema Zod y lanza un único `Error` con todos los problemas.                                           |
| `baseValidationSchema`                   | `object`              | Shape Zod con las variables de entorno obligatorias base.                                                                        |
| `baseValidationSchemaApp`                | `object`              | `baseValidationSchema` + variables de tracing opcionales.                                                                        |
| `validationSchemaCsrf`                   | `object`              | Shape Zod para `CSRF_SECRET`.                                                                                                    |
| `zBooleanFromEnv()` / `zNumberFromEnv()` | `function`            | Parsean booleanos y números que llegan como string desde el entorno.                                                             |
| `*Joi` (`validateSchemaForAppJoi`, ...)  | `function` / `object` | Versiones Joi anteriores, obsoletas.                                                                                             |

### Decorators

| Export                                                    | Descripción                                                             |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `Public()`                                                | Marca el endpoint/controller como público.                              |
| `IS_PUBLIC_KEY`                                           | `'isPublic'` — clave de metadata del decorador `@Public()`.             |
| `Roles(...roles)`                                         | Setea metadata de roles.                                                |
| `ROLES_KEY`                                               | `'roles'` — clave de metadata del decorador `@Roles()`.                 |
| `ExcludeFilter()`                                         | Excluye el endpoint/controller de filtros globales.                     |
| `EXCLUDE_FILTER_KEY`                                      | `'excludeFilter'` — clave de metadata del decorador `@ExcludeFilter()`. |
| `Csrf()`                                                  | Aplica `CsrfGuard` al endpoint/controller.                              |
| `Pagination()`                                            | Param decorator que extrae `{ page, size }` del query string.           |
| `Sorting(fields)`                                         | Param decorator que extrae y valida `sort` del query string.            |
| `FilteringParams(properties)`                             | Param decorator que extrae y valida `filters` del query string.         |
| `parseFilters(value)` / `convertFilterValue(rule, value)` | Helpers del parser de `filters`.                                        |

### Guards

| Export                                     | Descripción                                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `CsrfGuard`                                | Guard que valida el token CSRF, el User-Agent y la IP del cliente. Lanza `403 Forbidden` si la validación falla.                       |
| `RolesGuard`                               | Guard que compara los roles requeridos (`@Roles()`) contra `request.user.roles`/`role`, respetando `@Public()`. Lanza `403 Forbidden`. |
| `normalizeRoles(input)`                    | Normaliza uno o varios roles a strings en minúsculas sin espacios.                                                                     |
| `hasAnyRequiredRole(user, required)`       | `true` si el usuario tiene al menos uno de los roles requeridos.                                                                       |
| `RoleLike` / `RolesLike` / `IRolesRequest` | Tipos usados por `RolesGuard`.                                                                                                         |

### DTOs y Entities

| Export                  | Descripción                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `PaginationParamsDto`   | DTO con validación para `page` (default `1`) y `size` (default `10`, max `100`).   |
| `SortingParamsDto`      | DTO para el parámetro `sort`.                                                      |
| `FilteringParamsDto`    | DTO para el parámetro `filters`.                                                   |
| `SortCriteriaDto`       | DTO con `field` y `order`.                                                         |
| `FilteringCriteriaDto`  | DTO con `property`, `rule` y `values`.                                             |
| `PaginationMetaData`    | Clase Swagger con `page`, `size`, `total`, `totalPages`, `hasNext`, `hasPrevious`. |
| `PaginationResponse<T>` | Clase Swagger con `data: T[]` y `meta: PaginationMetaData`.                        |

### Utils

| Export                               | Tipo                                            | Descripción                                                 |
| ------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------- |
| `calculatePagination(params)`        | `(params: PaginateDataParams) => IPaginateData` | Calcula metadatos de paginación.                            |
| `PaginateDataParams`                 | `interface`                                     | `{ page, size, total }`                                     |
| `IPaginateData`                      | `interface`                                     | `PaginateDataParams & { totalPages, hasNext, hasPrevious }` |
| `getSkipHealthChecks(value)`         | `(value: string) => TSkipHealthChecks[]`        | Parsea un string CSV de health checks a omitir.             |
| `setHttpsOptions(certPath, keyPath)` | `(certPath, keyPath) => { cert, key }`          | Lee certificado y clave privada; `''` si no existen.        |

### Types y Enums

| Export             | Valores                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `FilterRule`       | `eq \| neq \| gt \| gte \| lt \| lte \| like \| nlike \| in \| nin \| isnull \| isnotnull` |
| `SortOrder`        | `'asc' \| 'desc'`                                                                          |
| `SortCriteria`     | `{ field: string; order: SortOrder }`                                                      |
| `Filtering<T>`     | `{ property: string; rule: FilterRule; values: T[] }`                                      |
| `PaginationParams` | `{ page: number; size: number }`                                                           |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
