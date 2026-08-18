<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Core</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
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
- Node.js v22.21.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v11.1.11 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/core
```

```
yarn add @tresdoce-nestjs-toolkit/core
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="use"></a>

## 👨‍💻 Uso

### Typings — Configuración centralizada

El namespace `Typings` expone todas las interfaces y enums que modelan la configuración centralizada de la aplicación (`config`).

```typescript
// ./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
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
  };
});
```

---

### Validation Schema

La función `validateSchemaForApp` genera un schema Joi que combina las validaciones base obligatorias del starter con las validaciones custom del proyecto.

```typescript
// ./src/config/validationSchema.ts
import Joi from 'joi';
import { validateSchemaForApp } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  // Parámetros custom de la aplicación
  RICK_AND_MORTY_API_URL: Joi.string().required(),
});
```

Si la aplicación implementa CSRF, también hay que extender con `validationSchemaCsrf`:

```typescript
// ./src/config/validationSchema.ts
import Joi from 'joi';
import { validateSchemaForApp, validationSchemaCsrf } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  ...validationSchemaCsrf,
  // Parámetros custom adicionales
  RICK_AND_MORTY_API_URL: Joi.string().required(),
});
```

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

const certPath = './path/to/secrets/public-certificate.pem';
const pkeyPath = './path/to/secrets/private-key.pem';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions: setHttpsOptions(certPath, pkeyPath),
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
import { Typings } from '@tresdoce-nestjs-toolkit/core';
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

`secure`: Si es `true`, la cookie solo se envía por HTTPS. El middleware lo establece automáticamente en `true` cuando `NODE_ENV === 'production'`.

- Type: `Boolean`
- Default: `false` (en local/test), `true` (en production)

`maxAge`: Tiempo de vida de la cookie en segundos.

- Type: `Number`
- Default: `300` (5 minutos)

</details>

### Implementación del middleware

```typescript
// ./src/main.ts
import { csrfToken } from '@tresdoce-nestjs-toolkit/core';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  //...
  const appConfig = app.get<ConfigService>(ConfigService)['internalConfig']['config'];
  //...
  app.use([
    cookieParser(appConfig.server.csrf.secret),
    csrfToken(appConfig.server.csrf),
    //...
  ]);
  //...
}
(async () => await bootstrap())();
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
import { ICsrfRequest } from '@tresdoce-nestjs-toolkit/core';

export class AuthController {
  @Get('/login')
  async login(@Req() req: ICsrfRequest) {
    req.csrfToken(); // Genera y setea el token de sesión en la cookie
    //...
  }
}
```

A partir de ese punto, cada request válido que pase por `CsrfGuard` generará automáticamente un nuevo token.

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
- En caso contrario, compara los roles requeridos contra `request.user.roles` (convención estándar de NestJS/Passport: se espera que un guard de autenticación previo, como `AuthGuard('jwt')`, ya haya poblado `request.user`). Si ninguno coincide, lanza `403 Forbidden`.

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
import { Pagination, PaginationParams } from '@tresdoce-nestjs-toolkit/core';

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

#### URL Example

- Schema: `<http|https>://<server_url><:port>/<context>/<endpoint>?page=<value>&size=<value>`
- Example: `http://localhost:8080/v1/users?page=2&size=20`

---

### `@Sorting(validFields)`

Extrae y valida el parámetro `sort` del query string. Retorna un array de `SortCriteria`.

```typescript
import { Controller, Get } from '@nestjs/common';
import { Sorting, SortCriteria } from '@tresdoce-nestjs-toolkit/core';

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
- Example: `http://localhost:8080/v1/users?sort=id:asc,email:desc`

---

### `@FilteringParams(validProperties)`

Extrae y valida el parámetro `filters` del query string. Retorna un array de `Filtering`.

```typescript
import { Controller, Get } from '@nestjs/common';
import { FilteringParams, Filtering } from '@tresdoce-nestjs-toolkit/core';

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
import { PaginationMetaData, PaginationResponse } from '@tresdoce-nestjs-toolkit/core';

// En un controller con Swagger:
@ApiOkResponse({ type: PaginationResponse })
@Get()
findAll(@Pagination() pagination: PaginationParams): PaginationResponse<UserEntity> {
  const [data, total] = await this.usersService.findAll(pagination);
  return {
    data,
    meta: calculatePagination({ ...pagination, total }),
  };
}
```

`PaginationResponse<T>` tiene las propiedades `data: T[]` y `meta: PaginationMetaData`.  
`PaginationMetaData` incluye: `page`, `size`, `total`, `totalPages?`, `hasNext?`, `hasPrevious?`.

---

<a name="api-reference"></a>

## 📖 API Reference

### Namespace `Typings`

| Export              | Descripción                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppConfig`         | Interface raíz de la configuración centralizada. Incluye `project`, `server`, `swagger`, `health`, `params`, `httpClient`, `services`, `database`, `redis`, `mailer`, `camunda`, `elasticsearch`, `tracing`, `redact`, `bcrypt`, `snowflakeUID`, `sqs`. |
| `IProjectConfig`    | Datos del proyecto (`apiPrefix`, `name`, `version`, `description`, `author`, `repository`, `bugs`, `homepage`).                                                                                                                                         |
| `IServerConfig`     | Configuración del servidor (`isProd`, `appStage`, `port`, `context`, `origins`, `propagateHeaders`, `allowedHeaders`, `allowedMethods`, `corsEnabled`, `corsCredentials`, `csrf`, `rateLimits`).                                                        |
| `IHealthConfig`     | Configuración de health checks (`skipChecks`, `storage`, `memory`).                                                                                                                                                                                     |
| `ISwaggerConfig`    | Configuración de Swagger (`path`, `enabled`).                                                                                                                                                                                                           |
| `TAppStage`         | `'local' \| 'test' \| 'snd' \| 'dev' \| 'qa' \| 'homo' \| 'prod'`                                                                                                                                                                                       |
| `EAppStage`         | Enum equivalente a `TAppStage`.                                                                                                                                                                                                                         |
| `TSkipHealthChecks` | `'storage' \| 'memory' \| 'elasticsearch' \| 'camunda' \| 'typeorm' \| 'redis'`                                                                                                                                                                         |
| `ESkipHealthChecks` | Enum equivalente a `TSkipHealthChecks`.                                                                                                                                                                                                                 |

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

### Validations

| Export                          | Tipo       | Descripción                                                                       |
| ------------------------------- | ---------- | --------------------------------------------------------------------------------- |
| `validateSchemaForApp(schema)`  | `function` | Retorna un schema Joi compuesto por `baseValidationSchemaApp` + el schema custom. |
| `validateSchema(schema, input)` | `function` | Valida un input contra un schema Joi, lanzando `Error` si falla.                  |
| `baseValidationSchema`          | `object`   | Schema Joi con las variables de entorno obligatorias base.                        |
| `baseValidationSchemaApp`       | `object`   | `baseValidationSchema` + variables de tracing opcionales.                         |
| `validationSchemaCsrf`          | `object`   | Schema Joi para `CSRF_SECRET`.                                                    |

### Decorators

| Export                        | Descripción                                                             |
| ----------------------------- | ----------------------------------------------------------------------- |
| `Public()`                    | Marca el endpoint/controller como público.                              |
| `IS_PUBLIC_KEY`               | `'isPublic'` — clave de metadata del decorador `@Public()`.             |
| `Roles(...roles)`             | Setea metadata de roles.                                                |
| `ROLES_KEY`                   | `'roles'` — clave de metadata del decorador `@Roles()`.                 |
| `ExcludeFilter()`             | Excluye el endpoint/controller de filtros globales.                     |
| `EXCLUDE_FILTER_KEY`          | `'excludeFilter'` — clave de metadata del decorador `@ExcludeFilter()`. |
| `Csrf()`                      | Aplica `CsrfGuard` al endpoint/controller.                              |
| `Pagination()`                | Param decorator que extrae `{ page, size }` del query string.           |
| `Sorting(fields)`             | Param decorator que extrae y valida `sort` del query string.            |
| `FilteringParams(properties)` | Param decorator que extrae y valida `filters` del query string.         |

### Guards

| Export       | Descripción                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `CsrfGuard`  | Guard que valida el token CSRF, el User-Agent y la IP del cliente. Lanza `403 Forbidden` si la validación falla.                |
| `RolesGuard` | Guard que compara los roles requeridos (`@Roles()`) contra `request.user.roles`, respetando `@Public()`. Lanza `403 Forbidden`. |

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

| Export                                | Tipo                                            | Descripción                                                 |
| ------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| `calculatePagination(params)`         | `(params: PaginateDataParams) => IPaginateData` | Calcula metadatos de paginación.                            |
| `PaginateDataParams`                  | `interface`                                     | `{ page, size, total }`                                     |
| `IPaginateData`                       | `interface`                                     | `PaginateDataParams & { totalPages, hasNext, hasPrevious }` |
| `getSkipHealthChecks(value)`          | `(value: string) => TSkipHealthChecks[]`        | Parsea un string CSV de health checks a omitir.             |
| `setHttpsOptions(certPath, pkeyPath)` | `function`                                      | Retorna `{ cert, key }` para habilitar HTTPS.               |

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
