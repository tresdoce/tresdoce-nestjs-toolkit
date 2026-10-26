<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Filters</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/filters.svg">
    <br/>
</div>
<br/>

> ⚠️ Este filtro también se re-exporta desde `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad
> core para el starter. Si ya usás `paas`, importalo desde ahí y no necesitás instalar este paquete.

Este paquete está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Provee `ExceptionsFilter`, un filtro global que captura **cualquier excepción** lanzada en una request HTTP
(`HttpException`, errores de validación, `Error` genéricos, strings, `null`…) y responde siempre con un payload
normalizado y el `Content-Type: application/problem+json`
([RFC 7807 - Problem Details](https://datatracker.ietf.org/doc/html/rfc7807)). La lógica de armado del payload
(`buildErrorPayload`) se exporta para reutilizarla en otros lugares, por ejemplo en el logging de `@tresdoce-nestjs-toolkit/elk`.

Usalo cuando quieras que todos los errores de tu API tengan el mismo formato, con un código de error
predecible (`<API_PREFIX>-<HTTP_STATUS>`) y la request que lo originó (`instance`).

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📨 Respuestas de ejemplo](#responses)
- [📋 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Proyecto ESM (`"type": "module"`). El paquete se distribuye solo como ESM.
- Aplicación HTTP sobre Express (`@nestjs/platform-express`).

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/filters
```

```
yarn add @tresdoce-nestjs-toolkit/filters
```

## 📦 Dependencias internas

| Paquete                                    | Razón                                                                       |
| ------------------------------------------ | --------------------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core) | Tipo `Typings.AppConfig` y `excludePaths()` (rutas de health/info/metrics). |

<a name="configurations"></a>

## ⚙️ Configuración

El filtro no es un módulo: se instancia a mano y se registra como filtro global. De la configuración centralizada
solo lee **`config.project.apiPrefix`** (`Typings.AppConfig['project']['apiPrefix']`), que se usa como prefijo del
`code` de error. Si la configuración o el prefijo no están disponibles, usa `DEFAULT_API_PREFIX` (`'API-PREFIX'`).

```typescript
//./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';

export default registerAs('config', (): Typings.AppConfig => ({
  project: {
    apiPrefix: process.env.API_PREFIX || 'API-PREFIX',
    //...
  },
  server: {
    context: process.env.CONTEXT || 'v1',
    //...
  },
  //...
}));
```

```typescript
//./src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { ExceptionsFilter } from '@tresdoce-nestjs-toolkit/filters';

import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(ConfigService).get<Typings.AppConfig>('config');

  app.setGlobalPrefix(appConfig.server.context);
  app.useGlobalFilters(new ExceptionsFilter(appConfig));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(appConfig.server.port);
}

bootstrap();
```

### Registro por inyección de dependencias (`APP_FILTER`)

Como alternativa a `useGlobalFilters`, el filtro puede registrarse vía DI. En ese caso Nest le inyecta el
`ConfigService` (opcional) y el filtro lee `config` de ahí. Requiere `ConfigModule.forRoot({ isGlobal: true, ... })`;
si no hay `ConfigService` disponible, usa `DEFAULT_API_PREFIX`.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ExceptionsFilter } from '@tresdoce-nestjs-toolkit/filters';

import { config } from './config/index.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] })],
  providers: [{ provide: APP_FILTER, useClass: ExceptionsFilter }],
})
export class AppModule {}
```

> Usá una sola de las dos formas (`APP_FILTER` o `useGlobalFilters`), no ambas.

### Variables de entorno

| Variable     | Uso                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `API_PREFIX` | (vía `config.project.apiPrefix`) Prefijo del `code` de error. Ej: `MY-API` → `MY-API-NOT_FOUND`.                                |
| `CONTEXT`    | Leída por `excludePaths()` de `core` para calcular las rutas excluidas (`/<CONTEXT>/health/liveness`, `/<CONTEXT>/info`, etc.). |

### Rutas excluidas

Las rutas devueltas por `excludePaths()` de `@tresdoce-nestjs-toolkit/core`
(`/<CONTEXT>/health/liveness`, `/<CONTEXT>/health/readiness`, `/<CONTEXT>/info` y `/<CONTEXT>/metrics`) **no** se
formatean: si la excepción es una `HttpException` se responde su `getResponse()` tal cual (así los health checks de
Terminus mantienen su formato), y para cualquier otro error se responde `500` con `{ "message": "Internal server error" }`.
La comparación ignora el query string.

<a name="use"></a>

## 👨‍💻 Uso

Una vez registrado el filtro no hace falta nada más: lanzá excepciones normalmente desde controllers, services, guards
o pipes. Para conocer todas las excepciones disponibles, ingresá a la documentación de
[NestJS - Built-in HTTP exceptions](https://docs.nestjs.com/exception-filters#built-in-http-exceptions).

```typescript
//./src/users/users.service.ts
import { Injectable, NotFoundException, ForbiddenException, HttpException } from '@nestjs/common';

@Injectable()
export class UsersService {
  async findOne(id: string) {
    const user = await this.repository.findOne(id);
    if (!user) {
      // message: 'User #123456 not found', detail: 'Not Found'
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  remove(id: string) {
    // message: 'You can not delete this user', detail: 'Only admins'
    throw new ForbiddenException('You can not delete this user', 'Only admins');
  }

  callExternal() {
    // message y detail personalizados (detail puede ser un objeto)
    throw new HttpException(
      { message: 'Upstream failed', error: { service: 'payments', reason: 'timeout' } },
      502,
    );
  }

  explode() {
    // Cualquier error que no sea HttpException se responde como 500
    throw new Error('this is an error');
  }
}
```

### Reglas de mapeo

| Excepción lanzada                                        | `status` | `message`                                      | `detail`                                   |
| -------------------------------------------------------- | -------- | ---------------------------------------------- | ------------------------------------------ |
| `new BadRequestException()`                              | `400`    | `'Bad Request'` (nombre del status)            | —                                          |
| `new NotFoundException('msg')`                           | `404`    | `'msg'`                                        | `'Not Found'`                              |
| `new ForbiddenException('msg', 'desc')`                  | `403`    | `'msg'`                                        | `'desc'`                                   |
| `new HttpException('msg', status)`                       | `status` | `'msg'`                                        | —                                          |
| `new HttpException({ message, error }, status)`          | `status` | `message` (o el nombre del status si es vacío) | `error`                                    |
| `ValidationPipe` / `new BadRequestException(['a', 'b'])` | `400`    | `'Bad Request'`                                | `[{ "message": "a" }, { "message": "b" }]` |
| `new Error('msg')`                                       | `500`    | `'msg'`                                        | —                                          |
| `throw 'msg'`                                            | `500`    | `'msg'`                                        | —                                          |
| `throw null` / objeto sin `message`                      | `500`    | `'Internal Server Error'`                      | —                                          |
| `new HttpException('msg', 499)` (status fuera del enum)  | `499`    | `'msg'`                                        | — (`code`: `<PREFIX>-499`)                 |

Si la respuesta ya fue enviada (`response.headersSent`, por ejemplo en un stream), el filtro no escribe nada.

### Reutilizar el payload fuera del filtro

```typescript
import { HttpException } from '@nestjs/common';
import { buildErrorPayload } from '@tresdoce-nestjs-toolkit/filters';

const { error } = buildErrorPayload(
  'MY-API',
  'delete',
  '/v1/users/1',
  new HttpException('Gone', 410),
);
// { status: 410, instance: 'DELETE /v1/users/1', code: 'MY-API-GONE', message: 'Gone', detail: undefined }
```

<a name="responses"></a>

## 📨 Respuestas de ejemplo

Todas las respuestas formateadas tienen el header `Content-Type: application/problem+json; charset=utf-8` y la forma
`{ "error": { status, instance, code, message, detail? } }`. Los ejemplos asumen `API_PREFIX=MY-API` y `CONTEXT=v1`.

> ℹ️ El payload sigue el espíritu de RFC 7807 (content-type, `status`, `instance`, `detail`), pero va envuelto en
> `error` y usa `code`/`message` en lugar de `type`/`title`.

#### 400 - Error de validación (`ValidationPipe`)

```http
POST /v1/users HTTP/1.1
Content-Type: application/json

{ "firstName": 123 }
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json; charset=utf-8
```

```json
{
  "error": {
    "status": 400,
    "instance": "POST /v1/users",
    "code": "MY-API-BAD_REQUEST",
    "message": "Bad Request",
    "detail": [
      { "message": "firstName must be a string" },
      { "message": "lastName must be a string" },
      { "message": "email must be an email" }
    ]
  }
}
```

#### 404 - Recurso no encontrado (`NotFoundException`)

```json
{
  "error": {
    "status": 404,
    "instance": "GET /v1/users/123456",
    "code": "MY-API-NOT_FOUND",
    "message": "User #123456 not found",
    "detail": "Not Found"
  }
}
```

#### 404 - Ruta inexistente

Nest lanza un `NotFoundException` cuando ninguna ruta matchea, y el filtro lo formatea igual:

```json
{
  "error": {
    "status": 404,
    "instance": "GET /v1/unknown",
    "code": "MY-API-NOT_FOUND",
    "message": "Cannot GET /v1/unknown",
    "detail": "Not Found"
  }
}
```

#### 500 - Error no controlado

```json
{
  "error": {
    "status": 500,
    "instance": "GET /v1/users",
    "code": "MY-API-INTERNAL_SERVER_ERROR",
    "message": "this is an error"
  }
}
```

> ⚠️ Para errores que no son `HttpException` se expone el `message` del error original. Si ese mensaje puede contener
> información sensible, capturalo y relanzalo como una `HttpException` con un mensaje controlado.

#### Sin `apiPrefix` configurado

```json
{
  "error": {
    "status": 400,
    "instance": "GET /v1/users",
    "code": "API-PREFIX-BAD_REQUEST",
    "message": "Bad Request"
  }
}
```

<a name="api-reference"></a>

## 📋 API Reference

### Exports

| Export                 | Tipo      | Descripción                                                                  |
| ---------------------- | --------- | ---------------------------------------------------------------------------- |
| `ExceptionsFilter`     | Clase     | Filtro global (`@Catch()`) que normaliza todas las excepciones HTTP.         |
| `buildErrorPayload`    | Función   | Arma el payload `{ error }` a partir de una excepción.                       |
| `getErrorMessage`      | Función   | Extrae `message` y `detail` del `getResponse()` de una `HttpException`.      |
| `getCode`              | Función   | Convierte un nombre de error a `UPPER_SNAKE_CASE`.                           |
| `PROBLEM_CONTENT_TYPE` | Constante | `'application/problem+json'`.                                                |
| `DEFAULT_API_PREFIX`   | Constante | `'API-PREFIX'`, prefijo usado cuando no hay `config.project.apiPrefix`.      |
| `IErrorPayload`        | Tipo      | Forma del payload devuelto por `buildErrorPayload` y enviado por el filtro.  |
| `IProblemDetail`       | Tipo      | Estructura genérica de un problem detail.                                    |
| `ExceptionResponse`    | Tipo      | Forma del `getResponse()` de una `HttpException`.                            |
| `IErrorDetail`         | Tipo      | Forma sugerida para el body de una `HttpException` con detalle estructurado. |

### ExceptionsFilter

```typescript
new ExceptionsFilter(appConfigOrConfigService?: Typings.AppConfig | ConfigService)
```

- Acepta el `Typings.AppConfig` (uso manual) o un `ConfigService` (inyectado de forma opcional cuando se registra
  por DI, por ejemplo con `APP_FILTER`); en ese caso lee `configService.get('config')` al instanciarse.

- Usa `appConfig.project.apiPrefix` para construir el `code`; si no existe usa `DEFAULT_API_PREFIX`.
- Responde con `Content-Type: application/problem+json` y el status de la excepción (`500` si no es `HttpException`).
- No formatea las rutas de `excludePaths()` ni escribe si `response.headersSent` es `true`.

### buildErrorPayload()

```typescript
buildErrorPayload(apiPrefix: string, method: string, url: string, exception: unknown): IErrorPayload
```

| Parámetro   | Type      | Description                                                             |
| ----------- | --------- | ----------------------------------------------------------------------- |
| `apiPrefix` | `string`  | Prefijo de la API, usado para construir el `code`.                      |
| `method`    | `string`  | Método HTTP de la request (se pasa a mayúsculas en `instance`).         |
| `url`       | `string`  | URL de la request (ej: `'/v1/users/123'`).                              |
| `exception` | `unknown` | Excepción capturada (`HttpException`, `Error`, string, `null`, objeto). |

### getErrorMessage()

```typescript
getErrorMessage(exceptionResponse: ExceptionResponse | string, httpStatus: string): ExceptionResponse
```

- Si es un string, lo usa como `message`.
- Si `message` es un array (validaciones), devuelve `error` como `message` y el array mapeado a `{ message }` en `detail`.
- Si no, devuelve `message` y usa `error` como `detail`.
- Si no hay `message`, usa el nombre del status en _Start Case_ (ej: `'NOT_FOUND'` → `'Not Found'`).

### getCode()

```typescript
getCode(exResponse: ExceptionResponse | string): string
```

Devuelve el string (o `exResponse.error`) en `UPPER_SNAKE_CASE` (`'Bad Request'` → `'BAD_REQUEST'`). Si no hay un valor
válido devuelve `'INTERNAL_SERVER_ERROR'`.

### Tipos

```typescript
interface IErrorPayload {
  error: {
    status: number;
    instance: string; // `${METHOD} ${url}`
    code: string; // `${apiPrefix}-${STATUS_NAME}`
    message: any;
    detail?: any;
  };
}

interface ExceptionResponse {
  error?: string;
  detail?: string;
  message?: string | string[] | ValidationError[];
}

interface IProblemDetail {
  status: number;
  instance?: string;
  code?: string;
  message: string;
  detail?: string | object | ValidationError[] | Array<string | object>;
  [key: string]: unknown;
}

interface IErrorDetail {
  message: string;
  error?: {
    type?: string;
    instance?: string;
    detail?: string;
    code?: string;
  };
}
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
