<div align='left'>
    <img alt="TresdoceLogo" width="180" height="auto" src="https://d1dq91zatgtr9n.cloudfront.net/logos/logoFull.svg"/>
</div>

<div align="center">
    <img alt="Nestjs-logo" width="250" height="auto" src="https://d1dq91zatgtr9n.cloudfront.net/logos/logo-nestjs.svg"/>
</div>

<div align="center">

# Tresdoce NestJS Toolkit<br/>Logger

</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Yarn&message=v1.22.22&labelColor=2C8EBB&logoColor=FFFFFF&color=757575&logo=yarn" alt="Yarn"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/>
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/logger.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en
la [NestJS Starter](https://github.com/rudemex/nestjs-starter),
siguiendo los lineamientos de arquitectura.

> ⚠️ Es importante tener en cuenta que este módulo se encuentra implementado en el paquete `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter y no requiere instalarse de manera adicional.

## Glosario

- [📝 Requerimientos básicos](#-requerimientos-básicos)
- [📘 Descripción](#-descripción)
- [🛠️ Instalar dependencia](#-instalar-dependencia)
- [⚙️ Configuración](#-configuración)
- [👨‍💻 Uso](#-uso)
- [🖥 Logs](#-logs)
- [📚 API](#-api)
- [📄 Changelog](./CHANGELOG.md)

---

<a name="-requerimientos-básicos"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- NodeJS v22.22 o superior ([Download](https://nodejs.org/es/download/))
- Yarn v1.22.22
- NestJS v12 o superior ([Documentación](https://nestjs.com/))

<a name="-descripción"></a>

## 📘 Descripción

Logging estructurado para aplicaciones NestJS basado en [pino](https://getpino.io) v10. El paquete expone:

- **`LoggingModule`**: módulo global que lee la configuración de `config.logger` y provee `LoggingService`.
- **`LoggingService`**: implementa `LoggerService` de Nest, así que sirve tanto para inyectarlo en tus servicios como para reemplazar el logger interno de Nest con `app.useLogger()`.
- **`LoggingInterceptor`**: loguea cada request/response HTTP (contexto, headers, body, query, status, duración y headers de tracing), aplicando ofuscación de datos sensibles con `RedactService` de `@tresdoce-nestjs-toolkit/utils`.

Usalo cuando quieras logs con un formato uniforme (`log_type`: `DEFAULT`, `REQUEST`, `RESPONSE`) aptos para ser indexados por un agregador (ELK, CloudWatch, Datadog, etc.).

### Salida según el entorno

La salida depende de `NODE_ENV`:

| `NODE_ENV`                        | Salida                                                                                                                                                           |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `production` / `test`             | **JSON** de una línea por log a `STDOUT`. Los campos objeto (`message`, headers, body, query) se serializan como `string` para mantener un tipo fijo por campo.  |
| cualquier otro valor o sin setear | Legible con el transport de [`pino-pretty`](https://github.com/pinojs/pino-pretty) (corre en un worker thread, coloreado). Los objetos se muestran como objetos. |

> ⚠️ Si tu entorno productivo no define `NODE_ENV=production`, vas a obtener la salida de `pino-pretty`.

<a name="-instalar-dependencia"></a>

## 🛠️ Instalar dependencia

```bash
npm install -S @tresdoce-nestjs-toolkit/logger
```

```bash
yarn add @tresdoce-nestjs-toolkit/logger
```

<a name="-configuración"></a>

## ⚙️ Configuración

El módulo lee la key `logger` de `Typings.AppConfig` (`ConfigService.get('config.logger')`). Toda la key es opcional: sin ella se loguea en nivel `info`, sin ofuscación ni exclusiones. Requiere `ConfigModule` registrado con `isGlobal: true`.

```typescript
// src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/paas';
import type { LoggingModuleLevel } from '@tresdoce-nestjs-toolkit/logger';

export default registerAs('config', (): Typings.AppConfig => ({
  // ...
  logger: {
    level: (process.env.LOG_LEVEL as LoggingModuleLevel) || 'info',
    redact: {
      paths: process.env.LOG_OBFUSCATE ? process.env.LOG_OBFUSCATE.split(',') : [],
      censor: '****',
      obfuscateFrom: 'right',
    },
    excludeContentType: process.env.LOG_EXCLUDE_CONTENT_TYPE
      ? process.env.LOG_EXCLUDE_CONTENT_TYPE.split(',')
      : [],
  },
  // ...
}));
```

```dotenv
# .env
NODE_ENV=development
LOG_LEVEL=debug
LOG_OBFUSCATE=http_request_headers.authorization,http_request_body.password
LOG_EXCLUDE_CONTENT_TYPE=application/pdf,application/octet-stream
```

### Opciones (`LoggerModuleOptions`)

| Propiedad            | Tipo                                                                       | Default | Descripción                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `level`              | `'fatal' \| 'error' \| 'warn' \| 'info' \| 'debug' \| 'trace' \| 'silent'` | `info`  | Nivel mínimo a emitir (en dev y en prod).                                                                                                   |
| `redact`             | `RedactOptions`                                                            | —       | Ofuscación aplicada a los logs de `REQUEST`/`RESPONSE`. Ver abajo.                                                                          |
| `excludeContentType` | `string[]`                                                                 | `[]`    | Si el `content-type` de la respuesta coincide **exactamente** (p. ej. `application/pdf`), el body no se loguea y se reemplaza por un aviso. |

### Ofuscamiento de datos (`redact`)

Se aplica con [fast-redact](https://github.com/davidmarkclements/fast-redact#paths--array) sobre el objeto de log **antes** de serializarlo, así que los paths parten de las keys del log (`http_request_headers`, `http_request_body`, `http_request_query_string`, `http_response_headers`, `http_response_body`).

> 💡 Express normaliza los nombres de headers a minúsculas: usá `http_request_headers.authorization` o `http_request_headers.apikey`, no `apiKey`. Para headers con guión: `http_request_headers["x-api-key"]`.

| Propiedad       | Tipo                   | Default | Descripción                                                                                               |
| --------------- | ---------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `paths`         | `string[]`             | `[]`    | Paths a ofuscar. Sintaxis: `a.b.c`, `a['b'].c`, `a["b-c"].d`, `a.b.*`, `a[*].c`, `*.b`, `a[0].b`.         |
| `censor`        | `string \| (v) => any` | `****`  | Reemplazo. Si es `string`, su longitud define cuántos caracteres del valor original se reemplazan.        |
| `obfuscateFrom` | `'left' \| 'right'`    | `right` | Lado desde el que se ofusca (`****123456784126` vs `400012345678****`). Aplica a todos los paths.         |
| `remove`        | `boolean`              | `false` | Elimina la key en lugar de ofuscarla.                                                                     |
| `serialize`     | `boolean \| Function`  | `false` | Serialización del resultado de fast-redact. Dejalo en `false`: el logger ya serializa los campos en prod. |
| `strict`        | `boolean`              | `false` | Opción `strict` de fast-redact.                                                                           |

### Registrar el módulo y el interceptor

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggingInterceptor, LoggingModule } from '@tresdoce-nestjs-toolkit/logger';

import configuration from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), LoggingModule],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
```

`LoggingInterceptor`:

- Solo actúa en contextos `http` (en RPC/WebSocket deja pasar la llamada sin loguear).
- No loguea los paths excluidos por `excludePaths()` de `@tresdoce-nestjs-toolkit/core` (health, docs, etc.).
- Emite el log `REQUEST` y el `RESPONSE` al finalizar el handler (tanto con respuesta como con excepción).
- En una excepción, el status sale de `HttpException.getStatus()` (o de `status`/`statusCode` numérico del error; si no, `500`) y el body logueado es `getResponse()` de la `HttpException` o `{ name, message }` para otros errores.
- Un fallo al armar el log nunca altera la respuesta: se loguea como `error` con contexto `LoggingInterceptor`.

### Usarlo como logger de Nest

Como `LoggingService` implementa `LoggerService`, podés reemplazar el logger de Nest para que los logs del framework (`RoutesResolver`, `NestApplication`, `ExceptionsHandler`…) y los de `new Logger(Context)` salgan con el mismo formato:

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { LoggingService } from '@tresdoce-nestjs-toolkit/logger';

import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule, { bufferLogs: true });
app.useLogger(app.get(LoggingService));
await app.listen(8080);
```

Con `bufferLogs: true` los logs del bootstrap se retienen hasta que se registra `LoggingService`. Mapeo de métodos de Nest:

| Nest `Logger`                 | `LoggingService`                       | Nivel pino |
| ----------------------------- | -------------------------------------- | ---------- |
| `log(msg, context)`           | `log` / `info`                         | `info`     |
| `error(msg, stack?, context)` | `error` (el stack va al campo `stack`) | `error`    |
| `warn(msg, context)`          | `warn`                                 | `warn`     |
| `debug(msg, context)`         | `debug`                                | `debug`    |
| `verbose(msg, context)`       | `verbose`                              | `trace`    |
| `fatal(msg, context)`         | `fatal`                                | `fatal`    |

El nivel efectivo lo define `config.logger.level`; `setLogLevels` de Nest no está implementado.

<a name="-uso"></a>

## 👨‍💻 Uso

Inyectá `LoggingService` en el componente donde lo necesites, o usá `Logger` de Nest si lo registraste con `app.useLogger()`.

```typescript
// src/users/users.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { LoggingService } from '@tresdoce-nestjs-toolkit/logger';

@Injectable()
export class UsersService {
  private readonly nestLogger = new Logger(UsersService.name);

  constructor(private readonly logger: LoggingService) {}

  create(user: { name: string }) {
    this.logger.log('User created', UsersService.name);
    this.logger.debug({ user }, UsersService.name);
    this.nestLogger.warn('Same format through Nest Logger');

    try {
      // ...
    } catch (error) {
      // Error: se loguean `message` y `stack`
      this.logger.error(error, UsersService.name);
    }
    return user;
  }
}
```

### Schema

```typescript
this.logger.<level>(message, ...optionalParams);
```

- `message`: `string`, primitivo, objeto/array o `Error`. En prod, objetos y arrays se serializan a `string`; un `Error` se loguea como `message` + `stack`.
- `optionalParams`: siguiendo la convención de Nest, el **último** parámetro `string` es el `context` (se ubica primero en el log). En `error`/`fatal`, `error(message, stack, context)` agrega el campo `stack`; un único parámetro con formato de stack trace se toma como `stack`.
- Si `message` ya es un log genérico (p. ej. el que arma `getGenericLog()` o `addRequestLogs()`), se emite tal cual sin envolverlo.

### Niveles

|   **Método**    | trace / verbose | debug | log / info | warn | error | fatal |  silent  |
| :-------------: | :-------------: | :---: | :--------: | :--: | :---: | :---: | :------: |
| **Level value** |       10        |  20   |     30     |  40  |  50   |  60   | Infinity |

Se emiten los logs con nivel mayor o igual a `level` (default `info`), tanto en dev como en prod. `silent` no emite nada.

<a name="-logs"></a>

## 🖥 Logs

Todos los logs comparten la base:

| Campo                                      | Origen                                                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `level`, `time`, `pid`, `hostname`         | pino                                                                                                                        |
| `context`                                  | Contexto recibido (opcional)                                                                                                |
| `application_name` / `application_version` | `npm_package_name`/`npm_package_version`, o el `package.json` del directorio de trabajo si se corre con `node dist/main.js` |
| `logger_name` / `logger_version`           | `package.json` de este paquete                                                                                              |
| `@timestamp`                               | ISO 8601                                                                                                                    |
| `log_level`                                | Nivel en mayúsculas (`INFO`, `ERROR`…)                                                                                      |
| `log_type`                                 | `DEFAULT`, `REQUEST` o `RESPONSE`                                                                                           |
| `message`                                  | Mensaje                                                                                                                     |
| `stack`                                    | Solo en errores                                                                                                             |

Los ejemplos siguientes son de una app real con `app.useLogger()`, `LoggingInterceptor` y `redact.paths: ['http_request_headers.authorization']`.

### DEFAULT

```typescript
new Logger('UsersService').log('User created');
// o: this.logger.log('User created', 'UsersService');
```

#### Desarrollo

```bash
[22:59:17.982] INFO (20673):
    context: "UsersService"
    application_name: "nestjs-starter"
    application_version: "1.0.0"
    logger_name: "@tresdoce-nestjs-toolkit/logger"
    logger_version: "4.0.0"
    @timestamp: "2026-10-26T01:59:17.981Z"
    log_level: "INFO"
    log_type: "DEFAULT"
    message: "User created"
```

#### Producción (JSON)

```json
{
  "level": 30,
  "time": 1792979957982,
  "pid": 20673,
  "hostname": "api-7c9f6d-xk2lp",
  "context": "UsersService",
  "application_name": "nestjs-starter",
  "application_version": "1.0.0",
  "logger_name": "@tresdoce-nestjs-toolkit/logger",
  "logger_version": "4.0.0",
  "@timestamp": "2026-10-26T01:59:17.981Z",
  "log_level": "INFO",
  "log_type": "DEFAULT",
  "message": "User created"
}
```

Con un objeto (`this.logger.log({ key: 'value', key2: ['a', 'b'] }, 'AppService')`) en prod el campo queda como `"message": "{\"key\":\"value\",\"key2\":[\"a\",\"b\"]}"`; en dev se muestra como objeto.

#### Error

```typescript
this.logger.error(new Error('Connection refused'), 'UsersService');
```

```json
{
  "level": 50,
  "time": 1792979958301,
  "pid": 20673,
  "hostname": "api-7c9f6d-xk2lp",
  "context": "UsersService",
  "application_name": "nestjs-starter",
  "application_version": "1.0.0",
  "logger_name": "@tresdoce-nestjs-toolkit/logger",
  "logger_version": "4.0.0",
  "@timestamp": "2026-10-26T01:59:18.301Z",
  "log_level": "ERROR",
  "log_type": "DEFAULT",
  "message": "Connection refused",
  "stack": "Error: Connection refused\n    at UsersService.create (file:///app/dist/users/users.service.js:21:19)\n    ..."
}
```

### REQUEST

`GET /users/1?fields=name` con header `authorization` ofuscado.

#### Desarrollo

```bash
[22:59:18.124] INFO (20673):
    application_name: "nestjs-starter"
    application_version: "1.0.0"
    logger_name: "@tresdoce-nestjs-toolkit/logger"
    logger_version: "4.0.0"
    @timestamp: "2026-10-26T01:59:18.117Z"
    log_level: "INFO"
    log_type: "REQUEST"
    message: "Request executed"
    http_request_execution_context_class: "UsersController"
    http_request_execution_context_handler: "findOne"
    http_request_execution_context_type: "http"
    http_request_headers: {
      "host": "localhost:8080",
      "connection": "keep-alive",
      "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9****",
      "accept": "*/*",
      "user-agent": "node",
      "accept-encoding": "gzip, deflate",
      "uber-trace-id": "657f49015a4d35832a47551384c251e9:62374d05f98bc739:0:01"
    }
    http_duration_ms: 3
    http_request_address: "http://localhost:8080/users/1"
    http_request_query_string: {
      "fields": "name"
    }
    http_request_method: "GET"
    http_request_path: "/users/1"
    http_request_remote_address: "::1"
    uber-trace-id: "657f49015a4d35832a47551384c251e9:62374d05f98bc739:0:01"
    trace_id: "657f49015a4d35832a47551384c251e9"
    span_id: "62374d05f98bc739"
    span_parent_id: "0"
    x_amzn_trace_id: "-"
    x_amzn_paren_id: "-"
    x_amzn_sampled_id: "-"
```

#### Producción (JSON)

```json
{
  "level": 30,
  "time": 1792979958124,
  "pid": 20673,
  "hostname": "api-7c9f6d-xk2lp",
  "application_name": "nestjs-starter",
  "application_version": "1.0.0",
  "logger_name": "@tresdoce-nestjs-toolkit/logger",
  "logger_version": "4.0.0",
  "@timestamp": "2026-10-26T01:59:18.117Z",
  "log_level": "INFO",
  "log_type": "REQUEST",
  "message": "Request executed",
  "http_request_execution_context_class": "UsersController",
  "http_request_execution_context_handler": "findOne",
  "http_request_execution_context_type": "http",
  "http_request_headers": "{\"host\":\"localhost:8080\",\"connection\":\"keep-alive\",\"authorization\":\"Bearer eyJhbGciOiJIUzI1NiJ9****\",\"accept\":\"*/*\",\"user-agent\":\"node\",\"accept-encoding\":\"gzip, deflate\",\"x-amzn-trace-id\":\"Root=1-657f4901-5a4d35832a47551384c251e9;Parent=62374d05f98bc739;Sampled=1\"}",
  "http_duration_ms": 3,
  "http_request_address": "http://localhost:8080/users/1",
  "http_request_query_string": "{\"fields\":\"name\"}",
  "http_request_method": "GET",
  "http_request_path": "/users/1",
  "http_request_remote_address": "::1",
  "trace_id": "-",
  "span_id": "-",
  "span_parent_id": "-",
  "x-amzn-trace-id": "Root=1-657f4901-5a4d35832a47551384c251e9;Parent=62374d05f98bc739;Sampled=1",
  "x_amzn_trace_id": "1-657f4901-5a4d35832a47551384c251e9",
  "x_amzn_paren_id": "62374d05f98bc739",
  "x_amzn_sampled_id": "1"
}
```

> `http_request_body` se omite cuando el request no tiene body (los valores `undefined` no se serializan). Los campos de tracing salen de los headers `uber-trace-id` (`{trace-id}:{span-id}:{parent-span-id}:{flags}`) y `x-amzn-trace-id` (`Root=…;Parent=…;Sampled=…`); si no vienen, valen `"-"`.

### RESPONSE

#### Desarrollo (`GET /users/0` → `NotFoundException`)

```bash
[22:59:18.174] INFO (20673):
    application_name: "nestjs-starter"
    application_version: "1.0.0"
    logger_name: "@tresdoce-nestjs-toolkit/logger"
    logger_version: "4.0.0"
    @timestamp: "2026-10-26T01:59:18.169Z"
    log_level: "INFO"
    log_type: "RESPONSE"
    message: "Response executed"
    http_response_execution_context_class: "UsersController"
    http_response_execution_context_handler: "findOne"
    http_response_execution_context_type: "http"
    http_response_status_code: 404
    http_response_status_phrase: "NOT_FOUND"
    http_response_headers: {
      "x-powered-by": "Express"
    }
    http_response_body: {
      "message": "User not found",
      "error": "Not Found",
      "statusCode": 404
    }
    http_duration_ms: 6
    http_request_address: "http://localhost:8080/users/0"
    http_request_query_string: {}
    http_request_method: "GET"
    http_request_path: "/users/0"
    http_request_remote_address: "::1"
    trace_id: "-"
    span_id: "-"
    span_parent_id: "-"
    x_amzn_trace_id: "-"
    x_amzn_paren_id: "-"
    x_amzn_sampled_id: "-"
```

#### Producción (JSON, `GET /users/1` → 200)

```json
{
  "level": 30,
  "time": 1792979958124,
  "pid": 20673,
  "hostname": "api-7c9f6d-xk2lp",
  "application_name": "nestjs-starter",
  "application_version": "1.0.0",
  "logger_name": "@tresdoce-nestjs-toolkit/logger",
  "logger_version": "4.0.0",
  "@timestamp": "2026-10-26T01:59:18.123Z",
  "log_level": "INFO",
  "log_type": "RESPONSE",
  "message": "Response executed",
  "http_response_execution_context_class": "UsersController",
  "http_response_execution_context_handler": "findOne",
  "http_response_execution_context_type": "http",
  "http_response_status_code": 200,
  "http_response_status_phrase": "OK",
  "http_response_headers": "{\"x-powered-by\":\"Express\"}",
  "http_response_body": "{\"id\":\"1\",\"name\":\"Mex\",\"email\":\"mex@tresdoce.com.ar\"}",
  "http_duration_ms": 6,
  "http_request_address": "http://localhost:8080/users/1",
  "http_request_query_string": "{\"fields\":\"name\"}",
  "http_request_method": "GET",
  "http_request_path": "/users/1",
  "http_request_remote_address": "::1",
  "trace_id": "-",
  "span_id": "-",
  "span_parent_id": "-",
  "x_amzn_trace_id": "-",
  "x_amzn_paren_id": "-",
  "x_amzn_sampled_id": "-"
}
```

Con `excludeContentType: ['application/pdf']`, una respuesta PDF loguea `"http_response_body": "\"The response body was excluded because of the content-type: application/pdf\""`.

<a name="-api"></a>

## 📚 API

### Exports

| Export                     | Tipo        | Descripción                                                                                                                              |
| -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `LoggingModule`            | Módulo      | Global. Lee `config.logger`, registra un `RedactModule` local (`isGlobal: false`) con `config.logger.redact` y exporta `LoggingService`. |
| `LoggingService`           | Servicio    | Logger pino que implementa `LoggerService` de Nest.                                                                                      |
| `LoggingInterceptor`       | Interceptor | Logs `REQUEST`/`RESPONSE` de cada request HTTP.                                                                                          |
| `LOGGING_MODULE_OPTIONS`   | `Symbol`    | Token de inyección de las opciones (`LoggerModuleOptions \| undefined`).                                                                 |
| `DEFAULT_BASE_GENERIC_LOG` | `string[]`  | Keys base de un log genérico.                                                                                                            |
| `LoggerModuleOptions`      | Interface   | `{ level?, redact?, excludeContentType? }`.                                                                                              |
| `LoggingModuleLevel`       | Type        | `LevelWithSilent` de pino.                                                                                                               |
| `LogType`                  | Type        | `'DEFAULT' \| 'REQUEST' \| 'RESPONSE' \| 'OUTGOING_REQUEST' \| 'OUTGOING_RESPONSE'`.                                                     |

### `LoggingService`

| Método                                                                                            | Descripción                                                                                 |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `log` / `info` / `warn` / `debug` / `trace` / `verbose` / `silent` `(message, ...optionalParams)` | Loguea en el nivel correspondiente (`verbose` → `trace`). Último param `string` = contexto. |
| `error` / `fatal` `(message, ...optionalParams)`                                                  | Además acepta `(message, stack, context)`.                                                  |
| `logFn(level, message, context?, stack?)`                                                         | Método base usado por los anteriores.                                                       |
| `getGenericLog(level, logType = 'DEFAULT', timestamp?)`                                           | Devuelve el objeto base de un log.                                                          |
| `addRequestLogs(request, context, timeRequest)`                                                   | Arma (y ofusca) el log `REQUEST`.                                                           |
| `addResponseLogs(request, response, body, context, timeRequest, isException)`                     | Arma (y ofusca) el log `RESPONSE`.                                                          |
| `readFile<T>(dir, filename)`                                                                      | Lee y parsea un JSON (helper interno).                                                      |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<br/>
<div align="center">
    <p>
        <br/><img src="https://d1dq91zatgtr9n.cloudfront.net/logos/logoIcon.svg" width="84" alt="TresdoceIcon" /><br/>
        Made with ❤
    </p>
</div>
