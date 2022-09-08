<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Tracing</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v8.2.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/tracing.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este interceptor se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.onrender.com/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.17 or higher
- NPM v6.14.13 or higher
- NestJS v8.2.6 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/tracing
```

```
yarn add @tresdoce-nestjs-toolkit/tracing
```

<a name="configurations"></a>

## ⚙️ Configuración

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    tracing: {
      serviceName: `${process.env.API_PREFIX.toLowerCase()}-${PACKAGE_JSON.name}`,
      jaegerConfig: {},
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`serviceName`: Es el nombre de la aplicación para la traza

- Type: `String`

`resourceAttributes`: Tags para la traza que se ingresa como objeto con `KEY:VALUE`

- Type: `Object`
- Default: `{ 'serviceName': options.serviceName }`

`excludeTracerPaths`: Array de paths para excluir la traza.

- Type: `Array`
- Default: `['/health/liveness', '/health/readiness', '/manifest']`

### jaegerConfig

Es la configuración para visualizar la traza en jaeger.

`jaegerConfig.endpoint`: Es el la ruta de la API de Jaeger para la traza.

- Type: `String`
- Default: `http://localhost:14268/api/traces`

`jaegerConfig.host`: Es el host de Jaeger.

- Type: `String`
- Default: `localhost`

`jaegerConfig.port`: Es el puerto para conectarse al Jaeger.

- Type: `number`
- Values: `6832`

`username`: Es el nombre de usuario para conectarse a Jaeger.

- Type: `String`

`password`: Es la contraseña de usuario para conectarse a Jaeger.

</details>

<a name="use"></a>

## 👨‍💻 Uso

Inicializamos **Opentelemetry** previo a inicializar la app, pasando los datos de la config.

```typescript
//./src/main.ts
import { otelSDK } from '@tresdoce-nestjs-toolkit/tracing';
import { config } from './config';

async function bootstrap() {
  await otelSDK(config().tracing).start();
  //...
}
```

Instanciamos el `TracingModule` y el `TracingInterceptor` para que empiece a realizar la traza de la app.

```typescript
//./src/app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TracingModule, TracingInterceptor } from '@tresdoce-nestjs-toolkit/tracing';

@Module({
  imports: [
    //...
    TracingModule,
    //...
  ],
  //...
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TracingInterceptor,
    },
    //...
  ],
})
export class AppModule {}
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="../../.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
