<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Paas</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/paas.svg">
    <br/>
</div>
<br/>

Esta librería está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [📦 Paquetes re-exportados](#packages)
- [⚙️ Configuración](#config)
- [👨‍💻 Setup completo de una app](#use)
- [📤 Ejemplos de respuestas y logs](#responses)
- [📚 API reference](#api)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Proyecto **ESM** (`"type": "module"` en el `package.json`, TS con `module: nodenext`): el paquete se publica solo como ESM.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/paas
```

```
yarn add @tresdoce-nestjs-toolkit/paas
```

`@tresdoce-nestjs-toolkit/paas` es un paquete **umbrella**: no tiene código propio, re-exporta en un único punto de
entrada los paquetes cross que usa cualquier app del starter. Instalando `paas` no hace falta instalar ni versionar
cada paquete por separado, y todos quedan alineados en versiones compatibles entre sí.

Los peer dependencies de NestJS (`@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/swagger`, etc.) y
`zod` (para el schema de variables de entorno) los provee la app.

<a name="packages"></a>

## 📦 Paquetes re-exportados

```typescript
// src/index.ts de paas
export * from '@tresdoce-nestjs-toolkit/core';
export * from '@tresdoce-nestjs-toolkit/filters';
export * from '@tresdoce-nestjs-toolkit/health';
export * from '@tresdoce-nestjs-toolkit/logger';
export * from '@tresdoce-nestjs-toolkit/response-parser';
export * from '@tresdoce-nestjs-toolkit/tracing';
export * from '@tresdoce-nestjs-toolkit/utils';
```

| Paquete                                    | Qué aporta                                                                              | README                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------- | ------------------------------ |
| `@tresdoce-nestjs-toolkit/core`            | `Typings`, schema de env con Zod, decoradores, guards, paginado/filtrado, CSRF          | [Ver docs](../core)            |
| `@tresdoce-nestjs-toolkit/filters`         | `ExceptionsFilter` global y `buildErrorPayload` (respuestas `application/problem+json`) | [Ver docs](../filters)         |
| `@tresdoce-nestjs-toolkit/health`          | `HealthModule` con `/health/liveness` y `/health/readiness` (`@nestjs/terminus`)        | [Ver docs](../health)          |
| `@tresdoce-nestjs-toolkit/logger`          | `LoggingModule`, `LoggingService` (pino) y `LoggingInterceptor` de request/response     | [Ver docs](../logger)          |
| `@tresdoce-nestjs-toolkit/response-parser` | `ResponseInterceptor`: envuelve arrays en `{ data }` y propaga headers                  | [Ver docs](../response-parser) |
| `@tresdoce-nestjs-toolkit/tracing`         | `otelProvider`, `TracingModule`, `TracingInterceptor`, `@SkipTrace()` (OpenTelemetry)   | [Ver docs](../tracing)         |
| `@tresdoce-nestjs-toolkit/utils`           | `RedactModule`, `FormatModule`, `BcryptModule` y sus servicios                          | [Ver docs](../utils)           |

> [!NOTE]
> `paas` depende de [`@tresdoce-nestjs-toolkit/rate-limit`](../rate-limit) (se instala junto con `paas`), pero **no
> lo re-exporta**. Para usar `RateLimitModule`, `ThrottlerGuard`, `@Throttle()`, etc., importalos desde
> `@tresdoce-nestjs-toolkit/rate-limit`.

> [!TIP]
> No hay nombres duplicados entre los paquetes re-exportados (con `export *`, un nombre exportado por dos paquetes
> se descarta en silencio en runtime). El paquete tiene un test que lo verifica para que no vuelva a pasar al
> agregar exports nuevos.

<a name="config"></a>

## ⚙️ Configuración

`paas` no lee configuración propia; cada módulo re-exportado lee su parte de la key `'config'` del `ConfigService`
(tipada como `Typings.AppConfig`):

| Key de `Typings.AppConfig`       | La usa                                  | Requerida |
| -------------------------------- | --------------------------------------- | --------- |
| `project.apiPrefix`              | `ExceptionsFilter` (prefijo del `code`) | Sí        |
| `server.context`                 | `TracingInterceptor` (paths excluidos)  | Sí        |
| `server.propagateHeaders`        | `ResponseInterceptor`                   | No        |
| `health` / `services` / `redis`… | `HealthModule` (readiness)              | No        |
| `logger`                         | `LoggingModule` (`LoggerModuleOptions`) | No        |
| `tracing`                        | `otelProvider` (`TracingOptions`)       | No        |

### Variables de entorno

`validateSchemaForApp()` (de `core`) valida con **Zod** las variables base del starter y las que le agregues. Devuelve
un schema Zod, que `@nestjs/config` 12 acepta directamente en `validationSchema` (Standard Schema).

| Variable                                   | Tipo                                    | Requerida |
| ------------------------------------------ | --------------------------------------- | --------- |
| `NODE_ENV`                                 | string                                  | Sí        |
| `APP_STAGE`                                | `local\|test\|snd\|dev\|qa\|homo\|prod` | Sí        |
| `PORT`                                     | number                                  | Sí        |
| `API_PREFIX`                               | string                                  | Sí        |
| `CONTEXT`                                  | string                                  | Sí        |
| `ORIGINS`                                  | string (separado por comas)             | Sí        |
| `ALLOWED_HEADERS` / `ALLOWED_METHODS`      | string                                  | Sí        |
| `CORS_ENABLED` / `CORS_CREDENTIALS`        | boolean (`true`/`false`)                | Sí        |
| `SWAGGER_PATH`                             | string                                  | Sí        |
| `SWAGGER_ENABLED`                          | boolean                                 | Sí        |
| `EXPOSED_HEADERS` / `PROPAGATE_HEADERS`    | string                                  | No        |
| `SKIP_HEALTH_CHECKS`                       | `storage,memory,redis,…`                | No        |
| `HEALTH_CHECK_STORAGE_PATH`                | string                                  | No        |
| `HEALTH_CHECK_STORAGE_THRESHOLD(_PERCENT)` | number                                  | No        |
| `HEALTH_CHECK_MEMORY_HEAP` / `_RSS`        | number                                  | No        |
| `TRACING_ENDPOINT` / `TRACING_AUTH_TOKEN`  | string                                  | No        |
| `TRACING_IGNORE_PATHS`                     | string                                  | No        |
| `CSRF_SECRET` (con `validationSchemaCsrf`) | string (obligatorio en `prod`)          | No        |

```dotenv
# .env.dev
NODE_ENV=dev
APP_STAGE=dev
PORT=8080
API_PREFIX=MY-API
CONTEXT=v1
ORIGINS=http://localhost:3000
ALLOWED_HEADERS=Content-Type,Authorization,Set-Cookie,Access-Control-Allow-Origin,Cache-Control,Pragma
ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
PROPAGATE_HEADERS=x-request-id
CORS_ENABLED=true
CORS_CREDENTIALS=false
SWAGGER_PATH=docs
SWAGGER_ENABLED=true
SKIP_HEALTH_CHECKS=storage
TRACING_ENDPOINT=http://localhost:4318/v1/traces
RICK_AND_MORTY_API_URL=https://rickandmortyapi.com
```

<a name="use"></a>

## 👨‍💻 Setup completo de una app

Estructura mínima de una app del starter que usa `paas`:

```
src/
├── config/
│   ├── configuration.ts      # registerAs('config', ...) → Typings.AppConfig
│   ├── validationSchema.ts   # schema Zod de las variables de entorno
│   └── index.ts
├── app.module.ts
└── main.ts
```

### `src/config/configuration.ts`

```typescript
import { registerAs } from '@nestjs/config';
import { getSkipHealthChecks, type Typings } from '@tresdoce-nestjs-toolkit/paas';

import PACKAGE_JSON from '../../package.json' with { type: 'json' };

export default registerAs('config', (): Typings.AppConfig => ({
  project: {
    apiPrefix: process.env.API_PREFIX || 'API-PREFIX',
    name: PACKAGE_JSON.name,
    version: PACKAGE_JSON.version,
    description: PACKAGE_JSON.description,
    author: PACKAGE_JSON.author,
    repository: PACKAGE_JSON.repository,
    bugs: PACKAGE_JSON.bugs,
    homepage: PACKAGE_JSON.homepage,
  },
  server: {
    isProd: process.env.NODE_ENV === 'production',
    appStage: process.env.APP_STAGE as Typings.TAppStage,
    port: parseInt(process.env.PORT, 10) || 8080,
    context: process.env.CONTEXT || 'v1',
    origins: process.env.ORIGINS ? process.env.ORIGINS.split(',') : '*',
    allowedHeaders: process.env.ALLOWED_HEADERS,
    allowedMethods: process.env.ALLOWED_METHODS,
    propagateHeaders: process.env.PROPAGATE_HEADERS ? process.env.PROPAGATE_HEADERS.split(',') : [],
    corsEnabled: process.env.CORS_ENABLED?.toLowerCase() === 'true',
    corsCredentials: process.env.CORS_CREDENTIALS?.toLowerCase() === 'true',
  },
  swagger: {
    path: process.env.SWAGGER_PATH || 'docs',
    enabled: process.env.SWAGGER_ENABLED?.toLowerCase() === 'true',
  },
  health: {
    skipChecks: getSkipHealthChecks(process.env.SKIP_HEALTH_CHECKS),
  },
  logger: {
    level: 'info',
    redact: {
      paths: ['http_request_headers.authorization', 'http_request_body.password'],
      censor: '****',
      obfuscateFrom: 'right',
    },
    excludeContentType: ['application/pdf'],
  },
  tracing: {
    resourceAttributes: {
      serviceName: PACKAGE_JSON.name,
      version: PACKAGE_JSON.version,
      'service.namespace': `${process.env.API_PREFIX}`,
      'deployment.environment': `${process.env.APP_STAGE}`,
    },
    exporter: {
      url: process.env.TRACING_ENDPOINT,
      headers: process.env.TRACING_AUTH_TOKEN
        ? { Authorization: `Bearer ${process.env.TRACING_AUTH_TOKEN}` }
        : undefined,
    },
    ignorePaths: process.env.TRACING_IGNORE_PATHS?.split(',') ?? [],
  },
  services: {
    rickAndMortyAPI: {
      url: process.env.RICK_AND_MORTY_API_URL,
      timeout: 3000,
      healthPath: '/api/character/1',
    },
  },
}));
```

> Importar el `package.json` con `with { type: 'json' }` requiere `resolveJsonModule: true` en el `tsconfig`.

### `src/config/validationSchema.ts`

```typescript
import { z } from 'zod';
import { validateSchemaForApp, validationSchemaCsrf } from '@tresdoce-nestjs-toolkit/paas';

// Variables base del starter + CSRF + las propias de la app.
export const validationSchema = validateSchemaForApp({
  ...validationSchemaCsrf,
  RICK_AND_MORTY_API_URL: z.url(),
});
```

Si falta una variable o tiene un formato inválido, la app no levanta y `@nestjs/config` informa todos los errores
juntos.

### `src/config/index.ts`

```typescript
export { default as config } from './configuration.js';
export * from './validationSchema.js';

const environments: Record<string, string> = {
  test: '.env.test',
  dev: '.env.dev',
  qa: '.env.qa',
  stg: '.env.stg',
  production: '.env',
};

export const getEnvFilePath = (): string => environments[`${process.env.NODE_ENV}`];
```

### `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ExceptionsFilter,
  HealthModule,
  LoggingInterceptor,
  LoggingModule,
  ResponseInterceptor,
  TracingInterceptor,
  TracingModule,
  type Typings,
} from '@tresdoce-nestjs-toolkit/paas';

import { config, getEnvFilePath, validationSchema } from './config/index.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: getEnvFilePath(),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [config],
      isGlobal: true, // obligatorio: todos los módulos del toolkit leen la key 'config'
      validationSchema,
    }),
    HealthModule, // GET /<context>/health/liveness y /<context>/health/readiness
    TracingModule, // TracingService + TracingInterceptor (global)
    LoggingModule, // LoggingService (global) configurado con config.logger
  ],
  providers: [
    // ExceptionsFilter recibe el AppConfig por constructor: se registra con un factory.
    {
      provide: APP_FILTER,
      useFactory: (configService: ConfigService) =>
        new ExceptionsFilter(configService.get<Typings.AppConfig>('config')),
      inject: [ConfigService],
    },
    // Los interceptors se ejecutan en el orden en que se registran (el primero envuelve al resto).
    { provide: APP_INTERCEPTOR, useClass: TracingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
```

> [!IMPORTANT]
> No registres `ExceptionsFilter` con `useClass`: su constructor recibe un `Typings.AppConfig` (una interfaz), que
> Nest no puede inyectar. Usá el `useFactory` de arriba o, en `main.ts`,
> `app.useGlobalFilters(new ExceptionsFilter(appConfig))`.

### `src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggingService, otelProvider, type Typings } from '@tresdoce-nestjs-toolkit/paas';

import { AppModule } from './app.module.js';
import { config } from './config/index.js';

async function bootstrap(): Promise<void> {
  // El SDK de OpenTelemetry tiene que arrancar antes de crear la app para instrumentar http.
  otelProvider(config().tracing);

  // bufferLogs + useLogger: los logs de arranque de Nest también salen por pino.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(LoggingService));

  const appConfig = app.get(ConfigService).get<Typings.AppConfig>('config');
  const { server, swagger, project } = appConfig;

  app.setGlobalPrefix(server.context);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (server.corsEnabled) {
    app.enableCors({
      origin: server.origins,
      allowedHeaders: server.allowedHeaders,
      methods: server.allowedMethods,
      credentials: server.corsCredentials,
    });
  }

  if (swagger.enabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle(project.name)
        .setVersion(project.version)
        .setDescription(project.description)
        .addServer(`/${server.context}`)
        .build(),
      { ignoreGlobalPrefix: true },
    );
    SwaggerModule.setup(`${server.context}/${swagger.path}`, app, document);
  }

  await app.listen(server.port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${server.port}/${server.context}`,
    project.name,
  );
}

void bootstrap();
```

### Rate limit (opcional)

```typescript
import { RateLimitModule } from '@tresdoce-nestjs-toolkit/rate-limit';

@Module({
  imports: [/* ...lo de arriba */ RateLimitModule],
})
export class AppModule {}
```

Lee los límites de `config.server.rateLimits`. Ver el [README de rate-limit](../rate-limit).

### Collector de trazas local (opcional)

`otelProvider` exporta trazas por OTLP/HTTP (protobuf) a `TRACING_ENDPOINT`. Para verlas en local alcanza con Jaeger:

```yaml
# docker-compose.yml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    environment:
      COLLECTOR_OTLP_ENABLED: 'true'
    ports:
      - '16686:16686' # UI → http://localhost:16686
      - '4318:4318' # OTLP HTTP → TRACING_ENDPOINT=http://localhost:4318/v1/traces
```

<a name="responses"></a>

## 📤 Ejemplos de respuestas y logs

**`GET /v1/health/liveness`**

```json
{ "status": "up" }
```

**`GET /v1/health/readiness`** (formato de `@nestjs/terminus`)

```json
{
  "status": "ok",
  "info": {
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "service-rickAndMortyAPI": { "status": "up" }
  },
  "error": {},
  "details": {
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "service-rickAndMortyAPI": { "status": "up" }
  }
}
```

**Controller que devuelve un array** (`ResponseInterceptor` lo envuelve en `data`; los objetos pasan sin cambios):

```json
{ "data": [{ "id": 1, "name": "Rick Sanchez" }] }
```

**Error** (`ExceptionsFilter`, `Content-Type: application/problem+json`), por ejemplo un `ValidationPipe` que falla:

```json
{
  "error": {
    "status": 400,
    "instance": "POST /v1/users",
    "code": "MY-API-BAD_REQUEST",
    "message": "Bad Request",
    "detail": [{ "message": "email must be an email" }]
  }
}
```

Para un error no controlado (`throw new Error('boom')`):

```json
{
  "error": {
    "status": 500,
    "instance": "GET /v1/characters",
    "code": "MY-API-INTERNAL_SERVER_ERROR",
    "message": "boom"
  }
}
```

**Log de response** emitido por `LoggingInterceptor` (con `NODE_ENV=production`, una línea JSON por log; los headers y
bodies se serializan como string y se redactan según `config.logger.redact`):

```json
{
  "level": 30,
  "time": 1761436800000,
  "application_name": "my-api",
  "application_version": "1.0.0",
  "logger_name": "@tresdoce-nestjs-toolkit/logger",
  "logger_version": "1.0.0",
  "@timestamp": "2026-10-25T21:00:00.000-03:00",
  "log_level": "INFO",
  "log_type": "RESPONSE",
  "message": "Response executed",
  "http_response_execution_context_class": "UsersController",
  "http_response_execution_context_handler": "findAll",
  "http_response_execution_context_type": "http",
  "http_response_status_code": 200,
  "http_response_status_phrase": "OK",
  "http_response_headers": "{\"x-request-id\":\"abc-123\"}",
  "http_response_body": "{\"data\":[{\"id\":1}]}",
  "http_duration_ms": 12,
  "http_request_address": "http://localhost:8080/v1/users",
  "http_request_method": "GET",
  "http_request_path": "/v1/users",
  "trace_id": "-",
  "span_id": "-",
  "span_parent_id": "-"
}
```

Las rutas de health, `/info` y `/metrics` no se loguean, no se trazan y no se normalizan en el filtro de errores
(ver `excludePaths()` de `core`).

<a name="api"></a>

## 📚 API reference

Todos los símbolos se importan desde `@tresdoce-nestjs-toolkit/paas`. Detalle de cada uno en el README del paquete
de origen.

| Paquete           | Exports principales                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`            | `Typings` (tipos), `validateSchemaForApp`, `validateSchema`, `baseValidationSchema`, `baseValidationSchemaApp`, `validationSchemaCsrf`, `zNumberFromEnv`, `zBooleanFromEnv`, `getSkipHealthChecks`, `excludePaths`, `corePathsExcludes`, `corePathsExcludesGlobs`, `Public`, `Roles`, `RolesGuard`, `ExcludeFilter`, `Csrf`, `CsrfGuard`, `Pagination`, `Sorting`, `FilteringParams`, `calculatePagination`, `setHttpsOptions`, DTOs de paginado/orden/filtro. Deprecados: `*Joi` (`validateSchemaForAppJoi`, etc.) |
| `filters`         | `ExceptionsFilter`, `buildErrorPayload`, `getErrorMessage`, `getCode`, `PROBLEM_CONTENT_TYPE`; tipos `ExceptionResponse`, `IProblemDetail`, `IErrorDetail`                                                                                                                                                                                                                                                                                                                                                          |
| `health`          | `HealthModule`, `CONFIG_OPTIONS`, `DEFAULT_SERVICE_LIVENESS_PATH`, `controllersExcludes`                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `logger`          | `LoggingModule`, `LoggingService`, `LoggingInterceptor`, `LOGGING_MODULE_OPTIONS`, `DEFAULT_BASE_GENERIC_LOG`; tipos `LoggerModuleOptions`, `LoggingModuleLevel`, `LogType`                                                                                                                                                                                                                                                                                                                                         |
| `response-parser` | `ResponseInterceptor`; tipo `ParsedResponse`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `tracing`         | `otelProvider`, `TracingModule`, `TracingService`, `TracingInterceptor`, `SkipTrace`; tipo `TracingOptions`                                                                                                                                                                                                                                                                                                                                                                                                         |
| `utils`           | `RedactModule`/`RedactService`, `FormatModule`/`FormatService`, `BcryptModule`/`BcryptService`, constantes `DEFAULT_*`, `REDACT_*`, `BCRYPT_*`; tipos `RedactOptions`, `RedactModuleOptions`, `BcryptOptions`, `BcryptVersion`                                                                                                                                                                                                                                                                                      |

### `LoggerModuleOptions` (`config.logger`)

| Opción               | Tipo                                                                       | Default  | Descripción                                      |
| -------------------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| `level`              | `'fatal' \| 'error' \| 'warn' \| 'info' \| 'debug' \| 'trace' \| 'silent'` | `'info'` | Nivel mínimo de pino                             |
| `redact`             | `RedactOptions`                                                            | —        | Paths a ofuscar en los logs de request/response  |
| `excludeContentType` | `string[]`                                                                 | `[]`     | Content-types cuyo body de response no se loguea |

### `TracingOptions` (`config.tracing`)

| Opción                | Tipo                                                                           | Descripción                                                        |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `resourceAttributes`  | `{ serviceName, version, 'service.namespace', 'deployment.environment', ... }` | Atributos del resource de OTel                                     |
| `exporter`            | `OTLPExporterNodeConfigBase`                                                   | `url`, `headers`, `timeoutMillis`… del exporter OTLP               |
| `httpInstrumentation` | `HttpInstrumentationConfig`                                                    | Opcional. Config de `@opentelemetry/instrumentation-http`          |
| `ignorePaths`         | `string[]`                                                                     | Opcional. Globs extra a no trazar (se suman a health/info/metrics) |

---

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
