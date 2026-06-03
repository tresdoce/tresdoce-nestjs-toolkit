<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Http-Client</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
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
- [📚 API Reference](#api-reference)
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
npm install -S @tresdoce-nestjs-toolkit/http-client
```

```
yarn add @tresdoce-nestjs-toolkit/http-client
```

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                    | Razón                                                            |
| ------------------------------------------ | ---------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core) | Tipos `Typings.AppConfig`, decoradores base y utilidades comunes |

<a name="configurations"></a>

## ⚙️ Configuración

El objeto `httpClient` es opcional en la configuración centralizada. Admite las opciones de [**Axios**](https://github.com/axios/axios#request-config)
y [**Axios-retry**](https://github.com/softonic/axios-retry#options) a través de la propiedad `httpOptions`, y también
permite propagar headers a las peticiones salientes mediante `propagateHeaders`.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
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

Objeto que combina `AxiosRequestConfig` y `AxiosRetryConfig`. Algunas propiedades destacadas:

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
`uber-trace-id` y `x-amzn-trace-id`.

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
variable de entorno (strings separados por coma).

### Importar el módulo

Importar `HttpClientModule` en el módulo que requiera utilizarlo, o de manera global en el `app.module.ts`.

El `HttpClientInterceptor` debe registrarse para que la propagación de headers funcione correctamente.
Es un interceptor con scope `REQUEST`, por lo que tiene acceso al contexto de la petición entrante.

```typescript
//./src/app.module.ts
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

```typescript
HttpClientModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
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
//./src/app.service.ts
import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { HttpClientService } from '@tresdoce-nestjs-toolkit/http-client';

@Injectable()
export class AppService {
  constructor(private readonly httpClient: HttpClientService) {}

  async getInfoFromApi() {
    try {
      const { status, data } = await this.httpClient.get('https://api.domain.com/resource');
      return data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  async createResource(payload: any) {
    try {
      const { data } = await this.httpClient.post('https://api.domain.com/resource', {
        data: payload,
      });
      return data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }
}
```

<a name="api-reference"></a>

## 📚 API Reference

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

Todos los métodos de request aplican automáticamente los headers configurados (defaults + propagados) y codifican la URL con `encodeURI`.

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
