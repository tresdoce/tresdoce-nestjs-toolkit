<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Commons</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.18.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v10.9.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.4.8&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/commons.svg">
    <br/>
</div>
<br/>

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
- Node.js v20.18.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.19 or higher
- NPM v10.9.0 or higher
- NestJS v10.4.8 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -D @tresdoce-nestjs-toolkit/commons
```

```
yarn add -D @tresdoce-nestjs-toolkit/commons
```

<a name="use"></a>

## 👨‍💻 Uso

### Eslint config

```typescript
// .eslintrc.js

const config = require('@tresdoce-nestjs-toolkit/commons');
module.exports = config.eslintConfig();
```

### Jest config

```typescript
// jest.config.ts

import { jestConfig } from '@tresdoce-nestjs-toolkit/commons';
import * as dotenv from 'dotenv';

process.env.NODE_ENV = 'test';

dotenv.config({
  path: '.env.test',
});

module.exports = jestConfig;
```

### Webpack config

#### Default Webpack Config

```json
//./nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": ["@nestjs/swagger"],
    "webpack": true,
    "webpackConfigPath": "./node_modules/@tresdoce-nestjs-toolkit/commons/dist-src/build-config/webpack.config.js"
  }
}
```

#### Custom Webpack Config

> ⚠️ El starter ya cuenta con una configuración para `webpack`, por lo que implementar una nueva configuración podría llegar a afectar el correcto funcionamiento del buildeado de la aplicación.

Para enviar una configuración custom al webpack de NestJS, se requiere crear un archivo `webpack.config.js` en el root
del proyecto, y en el archivo `nest-cli.json` borrar la línea de `webpackConfigPath` que está dentro del `compilerOptions`,
o bien dentro del archivo `webpack.config.js` escribir tu propia configuración.

```typescript
//./webpack.config.js
const { buildConfig } = require('@tresdoce-nestjs-toolkit/commons');
module.exports = (options) => {
  const newConfig = {
    entry: './src/serverless.ts',
  };

  return buildConfig(newConfig);
};
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
