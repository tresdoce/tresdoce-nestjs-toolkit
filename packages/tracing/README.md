<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Tracing</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.18.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.0.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.0.3&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/tracing.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este interceptor se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
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
- Node.js v20.18.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v11.0.0 or higher
- NestJS v11.0.3 or higher ([Documentación](https://nestjs.com/))

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
import * as PACKAGE_JSON from '../../package.json';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    tracing: {
      resourceAttributes: {
        serviceName: `${PACKAGE_JSON.name}`,
        version: PACKAGE_JSON.version,
        'service.namespace': `${process.env.API_PREFIX}`,
        'deployment.environment': process.env.APP_STAGE,
      },
      exporter: {
        url: process.env.TRACING_ENDPOINT,
        /*headers: {
          Authorization: '<token>',
        },*/
      },
      //ignorePaths: process.env.TRACING_IGNORE_PATHS ? process.env.TRACING_IGNORE_PATHS.split(',') : [],
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`resourceAttributes`: Tags para la traza que se ingresa como objeto con `KEY:VALUE`, puedes ver que valores admite
revisando la documentación de [Semantic Conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md)

- Type: `Object`
- Default: `{ 'serviceName': options.serviceName }`

`resourceAttributes.serviceName`: Es el nombre de la aplicación para la traza

- Type: `String`

`resourceAttributes.version`: Es la version de la aplicación para la traza

- Type: `String`

`resourceAttributes.service.namespace`: Es un nombre para agrupar la traza por grupos

- Type: `String`

`resourceAttributes.deployment.environment`: Es el entorno en el que está desplegado la aplicación

- Type: `String`

`exporter`: Es la configuración del exportador de la traza y sus valores se definen como `KEY:VALUE`, puedes ver que
valores admite revisando la documentación de [OTLP Exporter Configuration](https://opentelemetry.io/docs/concepts/sdk-configuration/otlp-exporter-configuration/)

- Type: `Object`
- Default: `{ 'url': 'http://localhost:4318/v1/traces' }`
- Example: `'http://localhost:4318/v1/traces' | 'http://docker:4318/v1/traces' | 'https://otelcol.aspecto.io/v1/trace'`

`exporter.url`: Es la url del endpoint que va a estar colectando la traza.

- Type: `String`

`exporter.headers`: Es la configuración de los headers del colector de la traza.

- Type: `Object`
- Example: `{ Authorization: '<aspecto-io-token>' }`

`ignorePaths`: Es una configuración opcional para excluir la traza por medio de los paths. Esta configuración es un array
de strings, donde los valores se escriben en formato `globs` y se suman a los excludes por defecto.

- Type: `Array`
- Default: `['**/health/liveness', '**/health/readiness', '**/info', '**/metrics', '**/docs', '**/docs/*', '**/docs/**']`
- Example: `['**/users/*', '**/test-env']`

</details>

<a name="use"></a>

## 👨‍💻 Uso

Inicializamos **Opentelemetry** previo a inicializar la app, pasando los datos de la config.

```typescript
//./src/main.ts
import { otelProvider } from '@tresdoce-nestjs-toolkit/tracing';
import { config } from './config';

async function bootstrap() {
  await otelProvider(config().tracing);
  //...
}

(async () => await bootstrap())();
```

Instanciar el `TracingModule` y el `TracingInterceptor` para que empiece a realizar la traza de la app.

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

Excluir paths para la traza

```typescript
//./src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { SkipTrace } from '@tresdoce-nestjs-toolkit/tracing';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return 'hello world!';
  }

  @SkipTrace() // use this decorator to skip trace
  @Get('my-util')
  getMyUtil() {
    return 'my util';
  }
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
