<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Health</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/health.svg">
    <br/>
</div>
<br/>

> ⚠️ Este módulo también se re-exporta desde `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core del starter. Si usás `paas`, no hace falta instalarlo por separado.

Módulo de health checks basado en [`@nestjs/terminus`](https://docs.nestjs.com/recipes/terminus) v12. Expone dos endpoints:

- **`GET /health/liveness`**: indica que el proceso está vivo. No consulta servicios externos (ideal para el `livenessProbe` de Kubernetes).
- **`GET /health/readiness`**: ejecuta los checks que se deducen automáticamente de la configuración centralizada (disco, memoria, servicios HTTP, TypeORM, Redis, Elasticsearch y Camunda) y responde `200` si todos están `up` o `503` si alguno está `down` (ideal para el `readinessProbe`).

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📨 Ejemplos de respuestas](#responses)
- [🐳 Servicios locales con Docker](#docker)
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
- Proyecto ESM (`"type": "module"`): el paquete se publica solo como ESM.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/health
```

```
yarn add @tresdoce-nestjs-toolkit/health
```

Dependencias relevantes que se instalan con el paquete:

| Paquete                                          | Razón                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core)       | Tipos `Typings.AppConfig` y decorador `@Public()`                       |
| [`@tresdoce-nestjs-toolkit/tracing`](../tracing) | Decorador `@SkipTrace()` (los health checks no generan spans)           |
| `@nestjs/terminus`                               | Motor de health checks e indicadores                                    |
| `@nestjs/axios`                                  | Requerido por `HttpHealthIndicator` (servicios, Elasticsearch, Camunda) |
| `@nestjs/microservices` + `ioredis`              | Requeridos por el ping a Redis (`Transport.REDIS`)                      |
| `@nestjs/typeorm` + `typeorm`                    | Requeridos por `TypeOrmHealthIndicator`                                 |

<a name="configurations"></a>

## ⚙️ Configuración

El módulo lee **toda** la configuración centralizada (`configService.get<Typings.AppConfig>('config')`) y la inyecta en los controllers con el token `CONFIG_OPTIONS`. Por eso `ConfigModule` tiene que estar registrado con `isGlobal: true` y una configuración `registerAs('config', ...)`.

Las claves que impactan en `/health/readiness` son `health`, `services`, `database.typeorm`, `redis`, `elasticsearch` y `camunda`. Ninguna es obligatoria: si una clave no está (o está vacía), su check no se agrega.

```typescript
//./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import { getSkipHealthChecks, type Typings } from '@tresdoce-nestjs-toolkit/core';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    health: {
      skipChecks: getSkipHealthChecks(process.env.SKIP_HEALTH_CHECKS),
      storage: {
        path: '/',
        thresholdPercent: 0.9, // 90% del disco
      },
      memory: {
        heap: 300 * 1024 * 1024, // 300 MB en bytes
        rss: 300 * 1024 * 1024, // 300 MB en bytes
      },
    },
    services: {
      myApi: {
        url: process.env.MY_API_URL, // ping a <origin>/health/liveness
      },
      myApiTwo: {
        url: process.env.MY_API_TWO_URL,
        timeout: 5000,
        healthPath: '/status',
      },
    },
    // Estas claves las usan otros paquetes del toolkit; health solo las reutiliza para el readiness:
    database: {
      typeorm: { type: 'postgres', host: 'localhost', port: 5432 /* ... */ },
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD,
    },
    elasticsearch: {
      node: process.env.ELASTIC_NODE,
      auth: { username: process.env.ELASTIC_USERNAME, password: process.env.ELASTIC_PASSWORD },
    },
    camunda: {
      baseUrl: process.env.CAMUNDA_URL, // ej: http://localhost:8080/engine-rest
    },
    //...
  };
});
```

Variables de entorno usadas en el ejemplo:

| Variable             | Ejemplo                             | Descripción                                           |
| -------------------- | ----------------------------------- | ----------------------------------------------------- |
| `SKIP_HEALTH_CHECKS` | `elasticsearch,memory`              | Lista (separada por comas) de checks a omitir.        |
| `MY_API_URL`         | `https://my-api.example.com/v1`     | URL del servicio; solo se usa su `origin`.            |
| `REDIS_HOST`/`PORT`  | `localhost` / `6379`                | Conexión a Redis (también la usa el paquete `redis`). |
| `ELASTIC_NODE`       | `http://localhost:9200`             | Nodo de Elasticsearch.                                |
| `CAMUNDA_URL`        | `http://localhost:8080/engine-rest` | Base URL del engine REST de Camunda.                  |

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

### `health`

`skipChecks`: lista de checks a omitir en el readiness. `getSkipHealthChecks()` (de `core`) normaliza un string separado por comas (trim + lowercase).

- Type: `TSkipHealthChecks[]`
- Values: `storage | memory | typeorm | redis | elasticsearch | camunda`
- Example: `elasticsearch,memory`

> Los servicios de `services` no se pueden omitir con `skipChecks`: para quitar uno, sacalo de la configuración.

`storage`: opciones de `DiskHealthIndicator.checkStorage()`. Se usa **una** de las dos variantes de umbral.

| Propiedad          | Type     | Description                                                                          |
| ------------------ | -------- | ------------------------------------------------------------------------------------ |
| `path`             | `string` | Ruta del sistema de archivos a monitorear (ej: `'/'` en Linux, `'C:\\'` en Windows). |
| `thresholdPercent` | `number` | Uso máximo permitido entre `0` y `1` (`0.9` = 90%).                                  |
| `threshold`        | `number` | Alternativa a `thresholdPercent`: uso máximo en **bytes**.                           |

`memory`: checks de `MemoryHealthIndicator`. Cada límite es opcional: solo se agrega el check del valor configurado.

| Propiedad | Type     | Key de resultado | Description                                      |
| --------- | -------- | ---------------- | ------------------------------------------------ |
| `heap`    | `number` | `memory_heap`    | Límite en **bytes** del heap de Node.js.         |
| `rss`     | `number` | `memory_rss`     | Límite en **bytes** del RSS (Resident Set Size). |

### `services`

Cada entrada genera un `HttpHealthIndicator.pingCheck()` con key `service-<nombre>` contra `<origin de url><healthPath>`. Cualquier respuesta 2xx/3xx se considera `up`.

| Propiedad    | Type     | Default            | Description                                                                                           |
| ------------ | -------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `url`        | `string` | —                  | URL del servicio. Solo se usa el `origin` (protocolo + host + puerto); el path se descarta.           |
| `timeout`    | `number` | `0` (sin límite)   | Timeout del ping en ms. Se recomienda configurarlo: con `0` un servicio colgado bloquea el readiness. |
| `healthPath` | `string` | `/health/liveness` | Path al que se hace el ping.                                                                          |

Si `url` falta o no es una URL válida (por ejemplo, una variable de entorno sin definir), el servicio se reporta como `down` con `message: "Invalid URL: ..."` en lugar de romper el endpoint.

</details>

### Checks automáticos por configuración

| Configuración presente | Check                                                                        | Key de resultado         | Se omite con    |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------ | --------------- |
| `health.storage`       | `DiskHealthIndicator.checkStorage()`                                         | `storage`                | `storage`       |
| `health.memory.heap`   | `MemoryHealthIndicator.checkHeap()`                                          | `memory_heap`            | `memory`        |
| `health.memory.rss`    | `MemoryHealthIndicator.checkRSS()`                                           | `memory_rss`             | `memory`        |
| `services.<name>`      | `HttpHealthIndicator.pingCheck()` a `<origin><healthPath>`                   | `service-<name>`         | —               |
| `database.typeorm`     | `TypeOrmHealthIndicator.pingCheck()` (DataSource por defecto)                | `typeorm-<type>`         | `typeorm`       |
| `redis`                | `MicroserviceHealthIndicator.pingCheck()` con `Transport.REDIS` (timeout 1s) | `redis` o `redis-<name>` | `redis`         |
| `elasticsearch`        | `HttpHealthIndicator.pingCheck()` al primer nodo de `node`/`nodes`           | `elasticsearch`          | `elasticsearch` |
| `camunda`              | `HttpHealthIndicator.pingCheck()` a `<baseUrl>/version`                      | `camunda`                | `camunda`       |

Detalles de cada check:

- **TypeORM**: hace `SELECT 1` sobre el `DataSource` por defecto registrado con `@nestjs/typeorm` (por ejemplo con `TypeOrmClientModule` de `@tresdoce-nestjs-toolkit/typeorm`). Si no hay `DataSource` registrado, el check queda `down` con `Connection provider not found in application context`.
- **Redis**: de `config.redis` se toman `host`, `port`, `username`, `password`, `database` (→ `db`) y `protocol: 'rediss'` (→ TLS). Se abre una conexión `ioredis`, se cierra enseguida y el resultado incluye `responseTime`.
- **Elasticsearch**: `node`/`nodes` acepta `string`, `string[]`, `NodeOptions` o `NodeOptions[]` (se usa el primero). `auth` se traduce a axios: `{ username, password }` → basic auth, `{ apiKey }` → header `Authorization: ApiKey ...`, `{ bearer }` → `Authorization: Bearer ...`.
- **Camunda**: ping a `GET <baseUrl>/version` del engine REST.

<a name="use"></a>

## 👨‍💻 Uso

Importar `HealthModule` una sola vez en el módulo principal (es `@Global()`). No tiene `register()`: siempre lee la configuración de `ConfigService`.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@tresdoce-nestjs-toolkit/health';

import configuration from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [configuration] }), HealthModule],
})
export class AppModule {}
```

Ambos endpoints están marcados con `@Public()` (no los bloquean los guards de autenticación del toolkit) y `@SkipTrace()`. `/health/readiness` está excluido de Swagger (`@ApiExcludeEndpoint()`); `/health/liveness` aparece con el tag `Monitoring`.

### Excluir las rutas del prefijo global

Para que los probes respondan en `/health/...` aunque la app use un prefijo global (ej. `/v1`), usá `controllersExcludes`:

```typescript
//./src/main.ts
import { NestFactory } from '@nestjs/core';
import { controllersExcludes } from '@tresdoce-nestjs-toolkit/health';

import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule);
app.setGlobalPrefix('v1', { exclude: controllersExcludes });
await app.listen(8080);
```

### Excluir las rutas de un middleware

```typescript
//./src/app.module.ts
import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { HealthModule, controllersExcludes } from '@tresdoce-nestjs-toolkit/health';

import { SomeMiddleware } from './some.middleware.js';

@Module({
  imports: [HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SomeMiddleware)
      .exclude(...controllersExcludes)
      .forRoutes('*');
  }
}
```

### Probes de Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /health/liveness
    port: 8080
readinessProbe:
  httpGet:
    path: /health/readiness
    port: 8080
  timeoutSeconds: 5
```

<a name="responses"></a>

## 📨 Ejemplos de respuestas

Las respuestas siguientes se generaron con `@nestjs/terminus` 12 y `HealthModule` (solo se adaptaron hosts/puertos).

### Liveness

`GET http://localhost:8080/health/liveness` → **200**

```json
{
  "status": "up"
}
```

### Readiness OK

Config con `health.storage` y `health.memory`.

`GET http://localhost:8080/health/readiness` → **200**

```json
{
  "status": "ok",
  "info": {
    "storage": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {},
  "details": {
    "storage": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

### Readiness con error

Con un servicio y Camunda caídos, y `database.typeorm` configurado sin un `DataSource` registrado. Terminus responde **503 Service Unavailable** con el mismo formato (`status: "error"`), y loguea `Health Check has failed!` con el detalle.

`GET http://localhost:8080/health/readiness` → **503**

```json
{
  "status": "error",
  "info": {
    "storage": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  },
  "error": {
    "service-myApi": {
      "message": "connect ECONNREFUSED 127.0.0.1:3001",
      "status": "down"
    },
    "typeorm-postgres": {
      "message": "Connection provider not found in application context",
      "responseTime": 761,
      "status": "down"
    },
    "camunda": {
      "message": "connect ECONNREFUSED 127.0.0.1:8080",
      "status": "down"
    }
  },
  "details": {
    "storage": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" },
    "service-myApi": {
      "message": "connect ECONNREFUSED 127.0.0.1:3001",
      "status": "down"
    },
    "typeorm-postgres": {
      "message": "Connection provider not found in application context",
      "responseTime": 761,
      "status": "down"
    },
    "camunda": {
      "message": "connect ECONNREFUSED 127.0.0.1:8080",
      "status": "down"
    }
  }
}
```

Otros mensajes que puede devolver un check `down`:

| Check                           | Ejemplo de detalle                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `storage`                       | `{ "message": "Used disk storage exceeded the set threshold", "status": "down" }`                                                  |
| `memory_heap` / `memory_rss`    | `{ "message": "Used heap exceeded the set threshold", "status": "down" }`                                                          |
| `service-<name>` (HTTP != 2xx)  | `{ "message": "Request failed with status code 500", "statusCode": 500, "statusText": "Internal Server Error", "status": "down" }` |
| `service-<name>` (URL inválida) | `{ "message": "Invalid URL: undefined", "status": "down" }`                                                                        |
| `redis` / `typeorm-<type>`      | `{ "message": "timeout of 1000ms exceeded", "responseTime": 1001, "status": "down" }`                                              |

> Los checks de TypeORM y Redis usan el builder `attempt()` de terminus 12, por eso incluyen `responseTime` (ms) tanto en `up` como en `down`.

<a name="docker"></a>

## 🐳 Servicios locales con Docker

El readiness solo verifica los servicios que estén configurados. Para probarlo localmente con todos los checks, un `docker-compose.yml` mínimo:

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: my_db
      POSTGRES_USER: root
      POSTGRES_PASSWORD: 123456

  redis:
    image: redis:7.4.2-alpine
    ports:
      - '6379:6379'
    command: ['redis-server', '--requirepass', '123456']

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:9.0.0
    ports:
      - '9200:9200'
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
      - xpack.security.enabled=false

  camunda:
    image: camunda/camunda-bpm-platform:run-latest
    ports:
      - '8080:8080' # engine REST en http://localhost:8080/engine-rest
```

> Si Camunda usa el puerto `8080`, levantá la app en otro puerto.

<a name="api-reference"></a>

## 📋 API Reference

### Exports

| Export                          | Tipo                                        | Descripción                                                                                                |
| ------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `HealthModule`                  | `@Global()` `@Module`                       | Registra `LivenessController` y `ReadinessController`, importa `TerminusModule` y provee `CONFIG_OPTIONS`. |
| `CONFIG_OPTIONS`                | `'CONFIG_OPTIONS'`                          | Token de inyección con el `Typings.AppConfig` completo (`configService.get('config')`).                    |
| `DEFAULT_SERVICE_LIVENESS_PATH` | `'/health/liveness'`                        | Path por defecto del ping a `services` cuando no se define `healthPath`.                                   |
| `controllersExcludes`           | `{ path: string; method: RequestMethod }[]` | `GET /health/liveness` y `GET /health/readiness`, para excluirlas del prefijo global o de middlewares.     |

### Endpoints

| Método | Ruta                | Respuesta                                                                   | Swagger           |
| ------ | ------------------- | --------------------------------------------------------------------------- | ----------------- |
| `GET`  | `/health/liveness`  | `200` `{ "status": "up" }`                                                  | Sí (`Monitoring`) |
| `GET`  | `/health/readiness` | `200` `HealthCheckResult` con `status: "ok"`, o `503` con `status: "error"` | No                |

### `HealthCheckResult` (terminus)

| Propiedad | Type                                               | Descripción                 |
| --------- | -------------------------------------------------- | --------------------------- |
| `status`  | `'ok' \| 'error' \| 'degraded' \| 'shutting_down'` | Estado general.             |
| `info`    | `Record<string, HealthIndicatorResult>`            | Checks `up` (o `degraded`). |
| `error`   | `Record<string, HealthIndicatorResult>`            | Checks `down`.              |
| `details` | `Record<string, HealthIndicatorResult>`            | Todos los checks.           |

### Interfaces de configuración (`@tresdoce-nestjs-toolkit/core`)

```typescript
type TSkipHealthChecks = 'storage' | 'memory' | 'elasticsearch' | 'camunda' | 'typeorm' | 'redis';

interface IHealthConfig {
  skipChecks?: TSkipHealthChecks[];
  storage?: DiskHealthIndicatorOptions; // { path, thresholdPercent } | { path, threshold }
  memory?: IHealthMemory; // { heap: number; rss: number } en bytes
}

interface IServicesConfig extends AxiosRequestConfig {
  healthPath?: string;
  [key: string]: any;
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
