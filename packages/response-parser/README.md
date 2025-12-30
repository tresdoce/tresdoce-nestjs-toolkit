<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Response-Parser</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/response-parser.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este interceptor se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [🖥 Respuesta](#response)
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
npm install -S @tresdoce-nestjs-toolkit/response-parser
```

```
yarn add @tresdoce-nestjs-toolkit/response-parser
```

<a name="configurations"></a>

## ⚙️ Configuración

Para utilizar este interceptor, es necesario instanciarlo como **provider** en el módulo principal (`app.module.ts`),
ya que este tiene integrado el uso del `ConfigService` para realizar la propagación de custom headers en la respuesta.

La implementación del formato de respuesta está implícito en cada respuesta de los controladores.

```typescript
//./src/app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@tresdoce-nestjs-toolkit/response-parser';

@Module({
  //...
  providers: [
    //...
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    //...
  ],
  //...
})
export class AppModule {}
```

<a name="response"></a>

## 🖥 Respuesta

### Single entity response

```json
{
  "id": 1,
  "name": "juan",
  "lastname": "perez"
}
```

### Multiple entity response

```json
{
  "data": [
    {
      "id": 1,
      "name": "juan",
      "lastname": "perez"
    },
    {
      "id": 2,
      "name": "jose",
      "lastname": "gonzalez"
    }
    //...
  ]
}
```

### Propagación de Headers

Para realizar la propagación de headers en la respuesta, solo se requiere agregar la propiedad `propagateHeaders` en la
configuración centralizada, esta propiedad admite un array de strings que puede ser configurada desde variables de entorno
como un string separado por comas.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      propagateHeaders: process.env.PROPAGATE_HEADERS
        ? process.env.PROPAGATE_HEADERS.split(',')
        : [],
      //...
    },
    //...
  };
});
```

```dotenv
#.env
#...
PROPAGATE_HEADERS=x-custom-header-1,x-custom-header-2,x-custom-header-n
#...
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
