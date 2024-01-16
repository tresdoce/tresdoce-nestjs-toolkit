<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJS Toolkit<br/>Core</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v18.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v9.6.7&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.3.0&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/core.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este módulo se encuentra implementado en el package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v18.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.18 or higher
- NPM v9.6.7 or higher
- NestJS v10.3.0 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/core
```

```
yarn add @tresdoce-nestjs-toolkit/core
```

<a name="use"></a>

## 👨‍💻 Uso

### Validation Schema

La validación del los parámetros (`envs`) que requiere la aplicación son validados por medio de la función
`validateSchemaForApp`, esta tienen integrado la validación los schemas obligatorios y base para la app.

#### ValidationSchema for App

```typescript
// ./src/config/validationSchema.ts
import Joi from 'joi';
import { validateSchemaForApp } from '@tresdoce-nestjs-toolkit/core';

export const validationSchema = validateSchemaForApp({
  // Custom parameters
  TEST_KEY: Joi.string().optional(),
  RICK_AND_MORTY_API_URL: Joi.string().required(),
  RICK_AND_MORTY_API_URL_LIVENESS: Joi.string().required(),
});
```

### corePathsExcludes

Es una variable que contiene una lista de `paths` con sus `methods` con el fin de ser excluidos tanto del `prefix` de la
app, como asi también de otras funcionalidades para que no generen registros innecesarios, como puede ser el caso de
los `logs`con los endpoints del `helath`.

```typescript
// ./src/main.ts
import { corePathsExcludes } from '@tresdoce-nestjs-toolkit/core';

async function bootstrap() {
  //...
  app.setGlobalPrefix(`${server.context}`, {
    exclude: [...corePathsExcludes()],
  });
  //...
}
```

### setHttpsOptions

Para implementar `SSL` en la app, se requiere tener la ruta del `cert`y la `privKey` para poder instanciarlo en los
options.

```typescript
// ./src/main.ts
import { setHttpsOptions } from '@tresdoce-nestjs-toolkit/core';

const certPath = './path/to/secrets/public-certificate.pem';
const pkeyPath = './path/to/secrets/private-key.pem';

async function bootstrap() {
  //...
  async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
      httpsOptions: setHttpsOptions(certPath, pkeyPath),
    });
  }
  //...
}
```

## Decorators

### Public

Decorador para definir si un endpoint es público.

```typescript
// ./src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Publico
  @Get('')
  @Public()
  getTestEnv(): string {
    return this.appService.getTestEnv();
  }

  // Privado
  @Get('my-util')
  getMyUtil() {
    return this.appService.getMyCustomUtil();
  }
}
```

### Roles

Decorador para definir el metadata de roles.

```typescript
// ./src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from '@tresdoce-nestjs-toolkit/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Only user role
  @Get('')
  @Roles('user')
  getTestEnv(): string {
    return this.appService.getTestEnv();
  }

  // Only user and admin role
  @Get('my-util')
  @Roles('user', 'admin')
  getMyUtil() {
    return this.appService.getMyCustomUtil();
  }
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
