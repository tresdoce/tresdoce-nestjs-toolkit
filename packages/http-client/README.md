<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Http-Client</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v18.20.3&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v10.8.1&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.3.10&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/http-client.svg">
    <br/>
</div>
<br/>

Este módulo está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v18.20.3 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v10.8.1 or higher
- NestJS v10.3.10 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/http-client
```

```
yarn add @tresdoce-nestjs-toolkit/http-client
```

<a name="configurations"></a>

## ⚙️ Configuración

El objeto `httpClient` es opcional a la configuración, la cual admite el objeto de configuración para [**Axios**](https://github.com/axios/axios#request-config)
y [**Axios-retry**](https://github.com/softonic/axios-retry#options) por medio de la propiedad `httpOptions`, y también es posible propagar headers a las peticiones
por medio de la propiedad `propagateHeaders` que es un array de string.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/paas';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    httpClient: {
      httpOptions: {
        timeout: 5000,
        retries: 5,
      },
      propagateHeaders: process.env.PROPAGATE_HEADERS_HTTP
        ? process.env.PROPAGATE_HEADERS_HTTP.split(',')
        : [],
    },
    //...
  };
});
```

Importar `HttpClientModule` en el módulo que requiera utilizarlo, o bien se puede utilizarla de manera global en
el `app.module.ts`.

En cuanto al `HttpClientInterceptor` es importante instanciarlo para poder propagar los headers de la traza y cualquier
otro header que se configure.

```typescript
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

> ⚠️ En caso de que la propagación de headers no se realice correctamente, verificar el orden de los `APP_INTERCEPTOR`

Este módulo utiliza **Axios** y **Axios-retry**, por lo que puedes pasarle cualquier configuración
de [AxiosRequestConfig](https://github.com/axios/axios#request-config)
y/o [AxiosRetryConfig](https://github.com/softonic/axios-retry#options) por medio del método `.register()` como si fuera
el `httpModule` original de **NestJs**, además de utilizar la configuración centralizada.

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpClientModule, HttpClientInterceptor } from '@tresdoce-nestjs-toolkit/http-client';

@Module({
  imports: [
    //...
    HttpClientModule.register({
      timeout: 1000,
      retries: 5,
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
    //...
  ],
  //...
})
export class AppModule {}
```

### Configuración async

Cuando necesite pasar las opciones del módulo de forma asincrónica en lugar de estática, utilice el método
`.registerAsync()` como si fuera el `httpModule` original de **NestJS**.

Hay varias formas para hacer esto.

- **useFactory**

Desde la configuración centralizada, debera crear un objeto de configuración para el módulo, y luego obtenerlo con la
inyección del `ConfigService`.

```typescript
HttpClientModule.registerAsync({
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => configService.get('config.httpOptions'),
  inject: [ConfigService],
});
```

O también puede hacerlo asi.

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

Tenga en cuenta que en este ejemplo, el `HttpConfigService` tiene que implementar la interfaz `HttpModuleOptionsFactory`
como se muestra a continuación.

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

Si desea reutilizar un proveedor de opciones existente en lugar de crear una copia dentro del `HttpClientModule`,
utilice la sintaxis `useExisting`.

```typescript
HttpClientModule.registerAsync({
  imports: [ConfigModule],
  useExisting: ConfigService,
});
```

<a name="use"></a>

## 👨‍💻 Uso

Inyectar el `HttpClientService` en el constructor de la clase y realice el request utilizando el servicio instanciando
en el constructor.

```typescript
//./src/app.service.ts
import { HttpClientService } from '@tresdoce-nestjs-toolkit/http-client';

export class AppService {
  constructor(private readonly httpClient: HttpClientService) {}
  //...

  async getInfoFromApi() {
    try {
      const { status, data } = await this.httpClient.get(encodeURI('https://api.domain.com'));
      return data;
    } catch (error) {
      throw new HttpException(error.response.data, error.response.status);
    }
  }

  //...
}
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
