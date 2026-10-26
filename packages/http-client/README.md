<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Http-Client</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/http-client.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [🧪 Testing](#testing)
- [📚 API Reference](#api-reference)
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
npm install -S @tresdoce-nestjs-toolkit/http-client
```

```
yarn add @tresdoce-nestjs-toolkit/http-client
```

El paquete es **ESM-only** (`"type": "module"`) y no requiere ningún servicio externo (no hace falta `docker-compose`).

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                        | Razón                                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/logger`](../logger) | Logs opcionales de requests salientes (solo si la app registra `LoggingModule`) |

La key `httpClient` está tipada en `Typings.AppConfig` de [`@tresdoce-nestjs-toolkit/core`](../core) (`Typings.IHttpClientConfig`).
El paquete también exporta la interfaz equivalente `HttpClientConfig` por si no usás `core`.

<a name="configurations"></a>

## ⚙️ Configuración

El objeto `httpClient` es opcional en la configuración centralizada. Admite las opciones de [**Axios**](https://github.com/axios/axios#request-config)
y [**Axios-retry**](https://github.com/softonic/axios-retry#options) a través de la propiedad `httpOptions`, y también
permite propagar headers a las peticiones salientes mediante `propagateHeaders`.

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    httpClient: {
      httpOptions: {
        timeout: 5000,
        retries: 5,
        retryDelay: 1000,
      },
      propagateHeaders: process.env.PROPAGATE_HEADERS_HTTP
        ? process.env.PROPAGATE_HEADERS_HTTP.split(',')
        : [],
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

#### `httpOptions`

Objeto que combina `CreateAxiosDefaults` (Axios) e `IAxiosRetryConfig` (Axios-retry). Algunas propiedades destacadas:

`timeout`: Tiempo máximo de espera por respuesta en milisegundos.

- Type: `Number`
- Default: sin límite

`retries`: Cantidad de reintentos ante fallo.

- Type: `Number`
- Default: `0`

`retryDelay`: Tiempo en milisegundos entre reintentos.

- Type: `Number`
- Default: `0`

`retryCondition`: Función que determina si se debe reintentar según el error.

- Type: `(error: AxiosError) => boolean`
- Default: `axiosRetry.isNetworkOrIdempotentRequestError`

Para más opciones consultar [AxiosRequestConfig](https://github.com/axios/axios#request-config)
y [AxiosRetryConfig](https://github.com/softonic/axios-retry#options).

#### `propagateHeaders`

Array de nombres de headers que se propagarán desde el request entrante hacia las peticiones salientes.
Además de los definidos aquí, siempre se propagan automáticamente los headers de traza:
`uber-trace-id` y `x-amzn-trace-id`. La comparación no distingue mayúsculas/minúsculas
(`X-Custom-Header` y `x-custom-header` son equivalentes).

- Type: `String[]`
- Default: `[]`

</details>

### Headers predeterminados

Todas las instancias de `HttpClientService` tienen los siguientes headers configurados por defecto:

```
Content-Type: application/json
Accept: application/vnd.iman.v1+json, application/json, text/plain, */*
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
```

> ⚠️ **Nota de seguridad:** Por defecto el `httpsAgent` tiene `rejectUnauthorized: false`, lo que deshabilita
> la verificación del certificado SSL/TLS. En entornos de producción se recomienda usar certificados válidos
> y ajustar esta configuración.

### Headers propagados automáticamente

Los siguientes headers de traza siempre se propagan desde el request entrante hacia todas las peticiones salientes,
sin necesidad de configuración adicional:

- `uber-trace-id`
- `x-amzn-trace-id`

Para propagar headers adicionales se usa `propagateHeaders` en la configuración o `PROPAGATE_HEADERS_HTTP` como
variable de entorno (strings separados por coma, ej: `PROPAGATE_HEADERS_HTTP=x-request-id,x-tenant-id`).

> ℹ️ `propagateHeaders` siempre se lee de `config.httpClient.propagateHeaders`, también cuando el módulo se registra
> con `.register()` o `.registerAsync()`.

> ℹ️ `HttpClientService` es un singleton, pero los headers propagados no se guardan en la instancia:
> `initAxios()` (que llama `HttpClientInterceptor` en cada request) los guarda en el contexto asíncrono del
> request con `AsyncLocalStorage`. Con requests entrantes concurrentes, cada llamada saliente lleva los headers
> del request que la originó. Fuera de un request (crons, bootstrap) solo se envían los headers por defecto.

### Importar el módulo

Importar `HttpClientModule` en el módulo que requiera utilizarlo, o de manera global en el `app.module.ts`.

El `HttpClientInterceptor` debe registrarse para que la propagación de headers funcione correctamente.
Es un interceptor con scope `REQUEST`, por lo que tiene acceso al contexto de la petición entrante.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpClientModule, HttpClientInterceptor } from '@tresdoce-nestjs-toolkit/http-client';

@Module({
  imports: [
    //...
    HttpClientModule,
    //...
  ],
  providers: [
    //...
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpClientInterceptor,
    },
    //...
  ],
  //...
})
export class AppModule {}
```

> ⚠️ En caso de que la propagación de headers no se realice correctamente, verificar el orden de los `APP_INTERCEPTOR`.

### Registro estático con `.register()`

Este módulo utiliza **Axios** y **Axios-retry**, por lo que podés pasarle cualquier configuración
de [AxiosRequestConfig](https://github.com/axios/axios#request-config)
y/o [AxiosRetryConfig](https://github.com/softonic/axios-retry#options) por medio del método `.register()`:

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpClientModule, HttpClientInterceptor } from '@tresdoce-nestjs-toolkit/http-client';

@Module({
  imports: [
    //...
    HttpClientModule.register({
      timeout: 1000,
      retries: 5,
      retryDelay: 500,
      //...
    }),
    //...
  ],
  providers: [
    //...
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpClientInterceptor,
    },
  ],
  //...
})
export class AppModule {}
```

### Configuración async con `.registerAsync()`

Cuando necesite pasar las opciones del módulo de forma asincrónica, utilice el método `.registerAsync()`.

- **useFactory**

Desde la configuración centralizada, obtener las opciones con `ConfigService`:

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpClientModule } from '@tresdoce-nestjs-toolkit/http-client';

HttpClientModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) =>
    configService.get('config.httpClient.httpOptions'),
  inject: [ConfigService],
});
```

O de manera inline:

```typescript
HttpClientModule.registerAsync({
  useFactory: () => ({
    timeout: 1000,
    retries: 5,
    //...
  }),
});
```

- **useClass**

```typescript
HttpClientModule.registerAsync({
  useClass: HttpConfigService,
});
```

El `HttpConfigService` debe implementar la interfaz `HttpModuleOptionsFactory`:

```typescript
import { Injectable } from '@nestjs/common';
import type {
  HttpModuleOptions,
  HttpModuleOptionsFactory,
} from '@tresdoce-nestjs-toolkit/http-client';

@Injectable()
class HttpConfigService implements HttpModuleOptionsFactory {
  async createHttpOptions(): Promise<HttpModuleOptions> {
    const configurationData = await someAsyncMethod();
    return {
      timeout: configurationData.timeout,
      retries: 5,
      //...
    };
  }
}
```

- **useExisting**

Reutiliza un provider ya registrado que implemente `HttpModuleOptionsFactory` (por ejemplo, el
`HttpConfigService` anterior, exportado desde otro módulo o agregado en `extraProviders`):

```typescript
HttpClientModule.registerAsync({
  imports: [HttpConfigModule], // módulo que exporta HttpConfigService
  useExisting: HttpConfigService,
});
```

- **extraProviders**

Para inyectar providers adicionales que la `useFactory` necesite pero que no estén importados como módulo:

```typescript
HttpClientModule.registerAsync({
  useFactory: (myService: MyService) => ({
    timeout: myService.getTimeout(),
  }),
  inject: [MyService],
  extraProviders: [MyService],
});
```

<a name="use"></a>

## 👨‍💻 Uso

Inyectar el `HttpClientService` en el constructor de la clase y realizar el request utilizando el servicio.

```typescript
//./src/characters/characters.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { HttpClientService } from '@tresdoce-nestjs-toolkit/http-client';

interface Character {
  id: number;
  name: string;
  status: string;
}

@Injectable()
export class CharactersService {
  constructor(private readonly httpClient: HttpClientService) {}

  async getCharacter(id: number): Promise<Character> {
    try {
      const { data } = await this.httpClient.get<Character>(
        `https://rickandmortyapi.com/api/character/${id}`,
      );
      return data;
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Upstream unavailable', HttpStatus.BAD_GATEWAY);
    }
  }

  async createResource(payload: Record<string, unknown>) {
    // El body va en `config.data`, no como segundo argumento posicional como en axios.post().
    const { data } = await this.httpClient.post('https://api.domain.com/resource', {
      data: payload,
    });
    return data;
  }
}
```

Los métodos devuelven el `AxiosResponse` completo. Ejemplo del objeto resuelto por `getCharacter` antes de quedarse con `data`:

```json
{
  "status": 200,
  "statusText": "OK",
  "headers": { "content-type": "application/json; charset=utf-8" },
  "data": { "id": 1, "name": "Rick Sanchez", "status": "Alive" }
}
```

Ante un error HTTP (4xx/5xx) la promesa se rechaza con un `AxiosError` (si el error cumple `retryCondition`, recién después de agotar los `retries`):

```json
{
  "message": "Request failed with status code 404",
  "code": "ERR_BAD_REQUEST",
  "response": { "status": 404, "data": { "error": "Character not found" } }
}
```

### Logs de requests salientes

Si la aplicación registra `LoggingModule` de `@tresdoce-nestjs-toolkit/logger` (ya viene incluido en `paas`), `HttpClientService` loguea cada request saliente con formato estructurado:

```json
{
  "application_name": "nestjs-starter",
  "application_version": "1.0.0",
  "logger_name": "@tresdoce-nestjs-toolkit/logger",
  "logger_version": "1.0.0",
  "@timestamp": "2026-10-25T12:00:00.000Z",
  "log_level": "INFO",
  "log_type": "OUTGOING_REQUEST",
  "context": "HttpClientService",
  "message": "Outgoing request executed",
  "outgoing_http_request_method": "GET",
  "outgoing_http_request_address": "https://rickandmortyapi.com/api/character",
  "outgoing_http_request_remote_address": "::1",
  "outgoing_http_response_status_code": 200,
  "outgoing_http_request_duration_ms": 182
}
```

Los requests que fallan se loguean con nivel `error` y la excepción se vuelve a lanzar. El mensaje de error es `Outgoing request failed: <error.message>` y `outgoing_http_response_status_code` vale `"-"` si no hubo respuesta (timeout, error de red).
Headers, body, query string, fragmento (`#...`) y credenciales embebidas en la URL (`user:pass@`) no se loguean, porque suelen tener tokens o datos personales.
`outgoing_http_request_remote_address` es la IP del request entrante (seteada por `HttpClientInterceptor`), o `"-"`. Sin `LoggingModule`, el servicio funciona igual y no loguea nada.

<a name="testing"></a>

## 🧪 Testing

Para testear servicios que usan `HttpClientService` sin pegarle a APIs reales, mockeá las respuestas con `nock`
(por ejemplo con `createMock` de `@tresdoce-nestjs-toolkit/test-utils`):

```typescript
import { createMock, cleanAllMock } from '@tresdoce-nestjs-toolkit/test-utils';

beforeEach(() => {
  createMock({
    url: 'https://rickandmortyapi.com/api/character/1',
    method: 'get',
    statusCode: 200,
    responseBody: { id: 1, name: 'Rick Sanchez', status: 'Alive' },
  });
});

afterEach(() => cleanAllMock());
```

<a name="api-reference"></a>

## 📚 API Reference

### Exports

| Export                     | Tipo        | Descripción                                                        |
| -------------------------- | ----------- | ------------------------------------------------------------------ |
| `HttpClientModule`         | Módulo      | Módulo `@Global()` que provee `HttpClientService`.                 |
| `HttpClientService`        | Servicio    | Cliente HTTP sobre una instancia de Axios con Axios-retry.         |
| `HttpClientInterceptor`    | Interceptor | Interceptor `Scope.REQUEST` que inicializa los headers a propagar. |
| `HttpModuleOptions`        | Tipo        | `CreateAxiosDefaults & IAxiosRetryConfig`.                         |
| `HttpModuleAsyncOptions`   | Interfaz    | Opciones de `registerAsync()`.                                     |
| `HttpModuleOptionsFactory` | Interfaz    | Contrato para `useClass` / `useExisting`.                          |
| `HttpClientConfig`         | Interfaz    | Forma de `config.httpClient` (`httpOptions`, `propagateHeaders`).  |

### `HttpClientModule`

| Método                                           | Descripción                                                                                   |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `HttpClientModule` (sin método)                  | Modo configuración centralizada. Lee `config.httpClient` automáticamente vía `ConfigService`. |
| `register(config: HttpModuleOptions)`            | Registra el módulo con opciones estáticas de Axios + Axios-retry.                             |
| `registerAsync(options: HttpModuleAsyncOptions)` | Registra el módulo con opciones asíncronas (`useFactory`, `useClass`, `useExisting`).         |

### `HttpModuleOptions`

Combina `CreateAxiosDefaults` (Axios) e `IAxiosRetryConfig` (Axios-retry). Propiedades destacadas:

| Propiedad        | Tipo                             | Descripción                                        |
| ---------------- | -------------------------------- | -------------------------------------------------- |
| `timeout`        | `number`                         | Timeout en ms para cada request.                   |
| `retries`        | `number`                         | Cantidad de reintentos ante fallo.                 |
| `retryDelay`     | `number`                         | Delay en ms entre reintentos.                      |
| `retryCondition` | `(error: AxiosError) => boolean` | Condición para decidir si se reintenta.            |
| `baseURL`        | `string`                         | URL base para todos los requests.                  |
| `headers`        | `object`                         | Headers adicionales (se mergean con los defaults). |

### `HttpModuleAsyncOptions`

| Propiedad        | Tipo                                                           | Descripción                                                        |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------------ |
| `imports`        | `any[]`                                                        | Módulos a importar.                                                |
| `useFactory`     | `(...args) => HttpModuleOptions \| Promise<HttpModuleOptions>` | Factory de opciones.                                               |
| `useClass`       | `Type<HttpModuleOptionsFactory>`                               | Clase que implementa `HttpModuleOptionsFactory`.                   |
| `useExisting`    | `Type<HttpModuleOptionsFactory>`                               | Provider existente que implementa `HttpModuleOptionsFactory`.      |
| `inject`         | `any[]`                                                        | Providers a inyectar en la factory.                                |
| `extraProviders` | `Provider[]`                                                   | Providers adicionales disponibles en el contexto del módulo async. |

### `HttpClientService`

| Método / Miembro       | Firma                                                                            | Descripción                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `axiosRef`             | `get axiosRef(): AxiosInstance`                                                  | Getter que retorna la instancia raw de Axios. Útil para configurar interceptors adicionales.                           |
| `initAxios(request)`   | `initAxios(request: Request): void`                                              | Inicializa los headers de propagación a partir del request entrante. Lo llama automáticamente `HttpClientInterceptor`. |
| `get(url, config?)`    | `get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`    | Realiza un request HTTP GET.                                                                                           |
| `post(url, config?)`   | `post<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`   | Realiza un request HTTP POST. El body va en `config.data`.                                                             |
| `put(url, config?)`    | `put<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`    | Realiza un request HTTP PUT. El body va en `config.data`.                                                              |
| `patch(url, config?)`  | `patch<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`  | Realiza un request HTTP PATCH. El body va en `config.data`.                                                            |
| `delete(url, config?)` | `delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>` | Realiza un request HTTP DELETE.                                                                                        |
| `head(url, config?)`   | `head<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>`   | Realiza un request HTTP HEAD.                                                                                          |
| `request(config)`      | `request<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>`              | Realiza un request HTTP con configuración completa (método, url, headers, data, etc.).                                 |

Todos los métodos de request aplican automáticamente los headers configurados (defaults + propagados) y codifican la URL con `encodeURI`
(no pases URLs ya codificadas: `%20` se convertiría en `%2520`; usá `params` para la query string).

Ejemplo con `request()` para casos avanzados:

```typescript
const { data } = await this.httpClient.request({
  method: 'POST',
  url: 'https://api.domain.com/resource',
  data: { key: 'value' },
  headers: { 'X-Custom-Header': 'custom' },
  params: { filter: 'active' },
});
```

### `HttpClientInterceptor`

Interceptor con scope `Scope.REQUEST` que llama a `HttpClientService.initAxios()` en cada request entrante,
inicializando los headers de propagación de traza. Debe registrarse como `APP_INTERCEPTOR`.

### `HttpModuleOptionsFactory` (interfaz)

Interfaz que deben implementar las clases usadas con `useClass` en `registerAsync()`.

```typescript
interface HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions;
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
