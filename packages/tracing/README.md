<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Tracing</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/tracing.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este módulo se encuentra re-exportado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Agrega **trazabilidad distribuida con [OpenTelemetry](https://opentelemetry.io/)** a una app NestJS:

- `otelProvider()` inicializa el SDK de OpenTelemetry (`NodeSDK`) con exporter **OTLP HTTP/protobuf**,
  instrumentación automática de `http`/`https` y propagación de contexto W3C, Baggage, B3 y AWS X-Ray.
- `TracingInterceptor` crea un span por cada request HTTP de tus controllers con controller, handler, método,
  status code y duración, y registra la excepción si el handler falla.
- `TracingService` permite crear spans propios y propagar el contexto.
- `@SkipTrace()` excluye handlers o controllers completos.

Usalo cuando quieras ver en Jaeger (o en cualquier backend compatible con OTLP: Grafana Tempo, AWS X-Ray vía
collector, Honeycomb, etc.) el recorrido de las requests entre tus servicios.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [🧾 Ejemplos de salida](#output-examples)
- [🐳 Jaeger local con Docker Compose](#docker-compose)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.15 or higher ([Download](https://nodejs.org/es/download/)) — mínimo requerido por OpenTelemetry JS 3.x
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Un colector compatible con OTLP HTTP (por ejemplo [Jaeger](#docker-compose))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/tracing
```

```
yarn add @tresdoce-nestjs-toolkit/tracing
```

<a name="internal-dependencies"></a>

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                      | Razón                                                              |
| -------------------------------------------- | ------------------------------------------------------------------ |
| [`@tresdoce-nestjs-toolkit/utils`](../utils) | Servicio `FormatService` para formateo de fechas y duraciones      |
| [`@tresdoce-nestjs-toolkit/core`](../core)   | Globs de paths excluidos por defecto (`health`, `info`, `metrics`) |

<a name="configurations"></a>

## ⚙️ Configuración

La configuración se lee del key `tracing` de `Typings.AppConfig` (`config.tracing`). `otelProvider()` recibe ese
objeto y el `TracingInterceptor` lee `config.tracing.ignorePaths` desde el `ConfigService`.

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import PACKAGE_JSON from '../../package.json' with { type: 'json' };

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    tracing: {
      resourceAttributes: {
        serviceName: PACKAGE_JSON.name,
        version: PACKAGE_JSON.version,
        'service.namespace': `${process.env.API_PREFIX}`,
        'deployment.environment': `${process.env.APP_STAGE}`,
      },
      exporter: {
        url: process.env.TRACING_ENDPOINT, // http://localhost:4318/v1/traces
        // headers: { Authorization: '<token>' },
        // timeoutMillis: 10000,
      },
      ignorePaths: process.env.TRACING_IGNORE_PATHS
        ? process.env.TRACING_IGNORE_PATHS.split(',')
        : [],
    },
    //...
  };
});
```

Variables de entorno sugeridas:

```dotenv
TRACING_ENDPOINT=http://localhost:4318/v1/traces
TRACING_IGNORE_PATHS=**/users/*,**/test-env
```

> 💡 El SDK de OpenTelemetry también respeta las variables estándar `OTEL_*` (por ejemplo
> `OTEL_EXPORTER_OTLP_TRACES_HEADERS` u `OTEL_RESOURCE_ATTRIBUTES`). Los valores pasados en `exporter` tienen prioridad.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`resourceAttributes`: Atributos del recurso (el servicio) que se adjuntan a todas las trazas. Además de las keys
requeridas podés agregar cualquier atributo de las
[Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/resource/).

- Type: `Object`

`resourceAttributes.serviceName`: Nombre del servicio. Se exporta como `service.name`.

- Type: `String`

`resourceAttributes.version`: Versión del servicio. Se exporta como `service.version`.

- Type: `String`

`resourceAttributes['service.namespace']`: Nombre para agrupar servicios.

- Type: `String`

`resourceAttributes['deployment.environment']`: Entorno en el que está desplegada la aplicación. Se exporta tanto
como `deployment.environment` como `deployment.environment.name` (la key vigente de las semantic conventions).

- Type: `String`

`exporter`: Configuración del `OTLPTraceExporter` (OTLP HTTP/protobuf). Ver
[OTLP Exporter Configuration](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/).

- Type: `TracingExporterOptions`
- Default de OpenTelemetry: `{ url: 'http://localhost:4318/v1/traces' }`

`exporter.url`: URL del endpoint OTLP HTTP de traces.

- Type: `String`
- Example: `'http://localhost:4318/v1/traces' | 'http://jaeger:4318/v1/traces'`

`exporter.headers`: Headers que se envían al colector (por ejemplo, tokens de autenticación).

- Type: `Object`
- Example: `{ Authorization: '<token>' }`

`httpInstrumentation`: Opciones de `HttpInstrumentation` (`HttpInstrumentationConfig`). Se combinan con los defaults
del paquete; si definís `ignoreIncomingRequestHook` reemplaza al hook basado en `ignorePaths`.

- Type: `HttpInstrumentationConfig`
- Default: `{ requireParentforIncomingSpans: false, ignoreIncomingRequestHook: <ignorePaths> }`

`ignorePaths`: Paths a excluir de la traza, en formato `glob`. Se suman a los excluidos por defecto y aplican tanto a
la instrumentación HTTP como al `TracingInterceptor`. El query string se ignora al comparar.

- Type: `String[]`
- Default: `['**/health/liveness', '**/health/readiness', '**/info', '**/metrics', '**/docs', '**/docs/*', '**/docs/**']`
- Example: `['**/users/*', '**/test-env']`

</details>

<a name="use"></a>

## 👨‍💻 Uso

### 1. Inicializar el proveedor de OpenTelemetry

`otelProvider()` tiene que ejecutarse **antes** de crear la app de Nest (`NestFactory.create`), para que la
instrumentación HTTP quede registrada antes de que se levante el servidor. Devuelve la instancia de `NodeSDK`
(o `undefined` si falló la inicialización, en cuyo caso loguea el error y la app sigue funcionando sin trazas).

```typescript
//./src/main.ts
import { NestFactory } from '@nestjs/core';
import { otelProvider } from '@tresdoce-nestjs-toolkit/tracing';

import { AppModule } from './app.module.js';
import config from './config/configuration.js';

async function bootstrap() {
  const sdk = otelProvider(config().tracing);

  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  // Envía los spans pendientes antes de cerrar el proceso.
  process.on('SIGTERM', () => {
    void sdk?.shutdown();
  });

  await app.listen(8080);
}

void bootstrap();
```

> 💡 Si además querés instrumentar módulos que se importan al cargar la app (ESM), podés mover la llamada a un
> archivo propio (por ejemplo `src/tracing.ts`) y cargarlo con `node --import ./dist/tracing.js dist/main.js`.

### 2. Registrar el módulo y el interceptor

`TracingModule` es `@Global()`, por lo que basta con importarlo una sola vez en el módulo raíz.
El `TracingInterceptor` tiene scope `Scope.REQUEST`, es decir, se instancia por cada request HTTP.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TracingModule, TracingInterceptor } from '@tresdoce-nestjs-toolkit/tracing';

import config from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] }), TracingModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
  ],
})
export class AppModule {}
```

El interceptor:

- Solo actúa en contextos `http` (ignora microservicios y websockets).
- Omite los handlers/controllers con `@SkipTrace()` y los paths de `ignorePaths`.
- Crea el span como hijo del span activo de la instrumentación HTTP o, si no hay, del contexto recibido en los headers
  (`traceparent`, `b3`, `X-Amzn-Trace-Id`).
- Inyecta el contexto en los headers de la response y en `request.headers`, y expone el span en `request.span`.
- Si el handler lanza una excepción, registra la excepción en el span, lo marca con status `ERROR` y usa el status
  de la `HttpException` (o `500`).

### 3. Excluir handlers o controllers con `@SkipTrace()`

```typescript
//./src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'hello world!';
  }

  @SkipTrace()
  @Get('my-util')
  getMyUtil(): string {
    return 'my util';
  }
}

@SkipTrace() // ningún handler de este controller se traza
@Controller('internal')
export class InternalController {}
```

### 4. Crear spans propios con `TracingService`

```typescript
import { Injectable } from '@nestjs/common';
import { SpanStatusCode } from '@opentelemetry/api';
import { TracingService } from '@tresdoce-nestjs-toolkit/tracing';

@Injectable()
export class CatsService {
  constructor(private readonly tracingService: TracingService) {}

  async findAll() {
    const span = this.tracingService.startSpan('cats.findAll', {
      attributes: { 'cats.source': 'db' },
    });
    try {
      return await this.loadCats();
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  }

  private async loadCats() {
    return [{ id: 1, name: 'nyan' }];
  }
}
```

Para colgar un span del contexto que llega en los headers de una request (por ejemplo en un handler que no pasa por
la instrumentación HTTP):

```typescript
const parentContext = this.tracingService.getParentContext(request.headers);
const span = this.tracingService.startSpan('process-job', {}, parentContext);
```

### 5. Debug con el header `tracing-tag`

Si la request incluye el header `tracing-tag`, el interceptor copia los headers de la request como atributos del span
(excepto `authorization`, `proxy-authorization`, `cookie`, `set-cookie` y `x-api-key`).

```bash
curl -H 'tracing-tag: debug-123' http://localhost:8080/v1/cats
```

<a name="output-examples"></a>

## 🧾 Ejemplos de salida

Log al inicializar el proveedor:

```
[Nest] 12345  - 26/10/2026, 09:00:00     LOG [TracingModule] Creating OpenTelemetry provider successfully!
```

Headers de propagación agregados a la response (los valores dependen del contexto):

```http
HTTP/1.1 200 OK
traceparent: 00-6719a2f0b2e3c4d5e6f708192a3b4c5d-8a3c60f7d188f8fa-01
x-amzn-trace-id: Root=1-6719a2f0-b2e3c4d5e6f708192a3b4c5d;Parent=8a3c60f7d188f8fa;Sampled=1
b3: 6719a2f0b2e3c4d5e6f708192a3b4c5d-8a3c60f7d188f8fa-1
x-b3-traceid: 6719a2f0b2e3c4d5e6f708192a3b4c5d
x-b3-spanid: 8a3c60f7d188f8fa
x-b3-sampled: 1
```

Atributos del span generado por el `TracingInterceptor` (vista en Jaeger, `GET /v1/cats`):

```json
{
  "operationName": "/v1/cats",
  "tags": {
    "timestamp": 1792929600000,
    "time.start": "26/10/2026 09:00:00.000",
    "http.operation": "http:CatsController:findAll",
    "http.controller": "CatsController",
    "http.handler": "findAll",
    "component": "http",
    "span.kind": "producer",
    "http.method": "GET",
    "http.url": "/v1/cats",
    "http.status_code": 200,
    "time.end": "26/10/2026 09:00:00.012",
    "time.duration": "12ms"
  },
  "logs": [{ "event": "REQUEST_RECEIVED" }, { "event": "RESPONSE_RECEIVED" }],
  "process": {
    "serviceName": "my-app",
    "tags": {
      "service.version": "0.0.1",
      "service.namespace": "tresdoce",
      "deployment.environment": "local",
      "deployment.environment.name": "local"
    }
  }
}
```

Cuando el handler falla (por ejemplo con `NotFoundException`), el span además incluye `error: true`,
`http.status_code: 404`, status `ERROR` y un evento `exception` con `exception.type`, `exception.message` y
`exception.stacktrace`.

<a name="docker-compose"></a>

## 🐳 Jaeger local con Docker Compose

[Jaeger v2](https://www.jaegertracing.io/docs/latest/) recibe OTLP directamente, por lo que no hace falta un collector
para desarrollo local.

```yaml
# docker-compose.yml
services:
  jaeger:
    image: jaegertracing/jaeger:2.22.0
    container_name: jaeger
    ports:
      - '16686:16686' # UI
      - '4317:4317' # OTLP gRPC
      - '4318:4318' # OTLP HTTP
```

```bash
docker compose up -d
```

Con `TRACING_ENDPOINT=http://localhost:4318/v1/traces`, hacé algunas requests a la app y abrí la UI de Jaeger en
[http://localhost:16686](http://localhost:16686) para buscar las trazas por `service.name`.

<details>
<summary>💬 Variante con OpenTelemetry Collector delante de Jaeger</summary>

Útil para replicar un entorno productivo (batching, filtros, múltiples backends).

```yaml
# docker-compose.yml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:0.162.0
    command: ['--config=/etc/otelcol/config.yaml']
    volumes:
      - ./otel-collector.yaml:/etc/otelcol/config.yaml:ro
    ports:
      - '4318:4318' # OTLP HTTP (la app exporta acá)
    depends_on:
      - jaeger

  jaeger:
    image: jaegertracing/jaeger:2.22.0
    ports:
      - '16686:16686' # UI
```

```yaml
# otel-collector.yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch: {}

exporters:
  otlp/jaeger:
    endpoint: jaeger:4317
    tls:
      insecure: true

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp/jaeger]
```

</details>

<a name="api-reference"></a>

## 📖 API Reference

### Exports

| Export                   | Tipo        | Descripción                                                                         |
| ------------------------ | ----------- | ----------------------------------------------------------------------------------- |
| `otelProvider`           | función     | Inicializa y arranca el SDK de OpenTelemetry                                        |
| `TracingModule`          | módulo      | Módulo global que provee `TracingService` y `TracingInterceptor`                    |
| `TracingInterceptor`     | interceptor | Span por request HTTP (scope `REQUEST`)                                             |
| `TracingService`         | servicio    | Helpers para crear spans y propagar contexto                                        |
| `TRACER_NAME`            | constante   | Nombre del tracer usado por `TracingService` (`'@tresdoce-nestjs-toolkit/tracing'`) |
| `SkipTrace`              | decorador   | Omite la traza de un handler o controller                                           |
| `TracingOptions`         | tipo        | Opciones del key `config.tracing`                                                   |
| `IResourceAttributes`    | tipo        | Atributos del recurso                                                               |
| `TracingExporterOptions` | tipo        | Opciones del `OTLPTraceExporter`                                                    |

### `otelProvider(options: TracingOptions): NodeSDK | undefined`

Crea e inicia un `NodeSDK` con:

- `resource`: `service.name`, `service.version`, `deployment.environment.name` y el resto de `resourceAttributes`
  (más los detectores por defecto del SDK: host, proceso, `OTEL_RESOURCE_ATTRIBUTES`).
- `traceExporter`: `OTLPTraceExporter` (HTTP/protobuf), envuelto por el SDK en un `BatchSpanProcessor`.
- `idGenerator`: `AWSXRayIdGenerator` (IDs compatibles con AWS X-Ray y W3C).
- `instrumentations`: `HttpInstrumentation` (ignora `ignorePaths`).
- `textMapPropagator`: `CompositePropagator` con, en orden:

| Propagador                     | Headers                                       |
| ------------------------------ | --------------------------------------------- |
| `AWSXRayPropagator`            | `x-amzn-trace-id`                             |
| `W3CTraceContextPropagator`    | `traceparent`, `tracestate`                   |
| `W3CBaggagePropagator`         | `baggage`                                     |
| `B3Propagator` (single header) | `b3`                                          |
| `B3Propagator` (multi header)  | `x-b3-traceid`, `x-b3-spanid`, `x-b3-sampled` |

> ⚠️ El propagador de Jaeger (`uber-trace-id`) se eliminó: OpenTelemetry JS 3.x ya no lo publica y la especificación
> recomienda W3C Trace Context. Jaeger acepta `traceparent` de forma nativa.

### `TracingModule`

Módulo global (`@Global()`) que provee y exporta `TracingService` y `TracingInterceptor`.
Incluye `FormatService` de `@tresdoce-nestjs-toolkit/utils` como provider interno.

### `TracingInterceptor`

Interceptor de scope `Scope.REQUEST`. Depende de `TracingService`, `ConfigService` y `Reflector`.

| Atributo del span  | Valor                                    |
| ------------------ | ---------------------------------------- |
| `timestamp`        | Epoch (ms) de inicio de la request       |
| `time.start`       | Fecha de inicio formateada               |
| `time.end`         | Fecha de fin formateada                  |
| `time.duration`    | Duración legible                         |
| `http.operation`   | `<tipo>:<Controller>:<handler>`          |
| `http.controller`  | Nombre del controller                    |
| `http.handler`     | Nombre del handler                       |
| `http.method`      | Método HTTP                              |
| `http.url`         | Path de la request (o `host` si es `/`)  |
| `http.status_code` | Status de la response o de la excepción  |
| `component`        | Tipo de contexto (`http`)                |
| `span.kind`        | `producer` (tag legado)                  |
| `error`            | `true` si el handler lanzó una excepción |

Eventos: `REQUEST_RECEIVED`, `RESPONSE_RECEIVED` y `exception` (en errores).

### `TracingService`

| Miembro                                     | Firma                                      | Descripción                                                                   |
| ------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------- |
| `spanContext`                               | `Context` (propiedad)                      | Último contexto establecido por `setSpanContext()`                            |
| `getTracer()`                               | `() => Tracer`                             | Retorna el tracer `TRACER_NAME`                                               |
| `startSpan(name, options?, context?)`       | `(string, SpanOptions?, Context?) => Span` | Crea e inicia un span (hijo del contexto activo si no se pasa `context`)      |
| `startActiveSpan(name, options?, context?)` | `(string, SpanOptions?, Context?) => Span` | Alias de `startSpan` (no activa el span en el contexto)                       |
| `extractSpanFromHeaders(headers)`           | `(IncomingHttpHeaders) => Context`         | Extrae el contexto propagado en los headers                                   |
| `getParentContext(headers)`                 | `(IncomingHttpHeaders) => Context`         | Contexto activo si hay un span en curso; si no, el extraído de los headers    |
| `getParentSpanOptions(headers)`             | `(IncomingHttpHeaders) => SpanOptions`     | **Deprecado**: devuelve `{ childOf }` (OpenTracing), que OpenTelemetry ignora |
| `setSpanContext(headers)`                   | `(IncomingHttpHeaders) => void`            | Inyecta el contexto activo en los headers y lo guarda en `spanContext`        |
| `propagateSpanContext(headers)`             | `(IncomingHttpHeaders) => void`            | Inyecta el contexto activo en los headers (propagación saliente)              |
| `setSpanTags(span, headers)`                | `(Span, IncomingHttpHeaders) => void`      | Si existe `tracing-tag`, copia los headers no sensibles como atributos        |
| `generateDuration(start, end)`              | `(number, number) => string \| number`     | Duración legible entre dos timestamps                                         |
| `formatDate(timestamp)`                     | `(number \| string \| Date) => string`     | Formatea un timestamp                                                         |

### `TracingOptions`

| Campo                                          | Tipo                        | Requerido | Descripción                              |
| ---------------------------------------------- | --------------------------- | --------- | ---------------------------------------- |
| `resourceAttributes`                           | `IResourceAttributes`       | Sí        | Atributos del recurso                    |
| `resourceAttributes.serviceName`               | `string`                    | Sí        | Nombre del servicio (`service.name`)     |
| `resourceAttributes.version`                   | `string`                    | Sí        | Versión del servicio (`service.version`) |
| `resourceAttributes['service.namespace']`      | `string`                    | Sí        | Namespace del servicio                   |
| `resourceAttributes['deployment.environment']` | `string`                    | Sí        | Entorno de despliegue                    |
| `exporter`                                     | `TracingExporterOptions`    | Sí        | Configuración del exporter OTLP HTTP     |
| `httpInstrumentation`                          | `HttpInstrumentationConfig` | No        | Opciones de la instrumentación HTTP      |
| `ignorePaths`                                  | `string[]`                  | No        | Paths adicionales a excluir (globs)      |

### `SkipTrace()`

Decorador de método o clase que omite la generación del span del `TracingInterceptor`.

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
