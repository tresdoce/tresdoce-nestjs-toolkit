<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Commons</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/commons.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Centraliza configuraciones de **ESLint**, **Jest**, **Webpack** y herramientas de build que son comunes a todos los
paquetes del monorepo y proyectos derivados.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
  - [ESLint config](#eslint-config)
  - [Jest config](#jest-config)
  - [Webpack config](#webpack-config)
  - [CLI Starter Webpack config](#cli-starter-webpack-config)
  - [buildConfig](#buildconfig)
- [📖 API Reference](#api-reference)
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

Este paquete es una **dependencia de desarrollo** (`devDependency`).

```
npm install -D @tresdoce-nestjs-toolkit/commons
```

```
yarn add -D @tresdoce-nestjs-toolkit/commons
```

### Peer dependencies requeridas para ESLint

El uso de `eslintConfig()` requiere que las siguientes dependencias de peer estén instaladas en el proyecto:

```
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier
```

```
yarn add -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-prettier
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="use"></a>

## 👨‍💻 Uso

<a name="eslint-config"></a>

### ESLint config

Exporta la función `eslintConfig()` que retorna una configuración ESLint preconfigurada con soporte para TypeScript y Prettier.

```javascript
// .eslintrc.js
const { eslintConfig } = require('@tresdoce-nestjs-toolkit/commons');
module.exports = eslintConfig();
```

La configuración resultante incluye:

- Parser: `@typescript-eslint/parser` con `sourceType: 'module'`
- Plugins: `@typescript-eslint/eslint-plugin`
- Extends: `plugin:@typescript-eslint/recommended`, `plugin:prettier/recommended`
- Entorno: `node: true`, `jest: true`
- Ignore patterns: `.eslintrc.js`, `**/__test__/**/*`, `dist/`, `coverage/`
- Reglas relajadas: `no-explicit-any`, `no-var-requires`, `no-require-imports`, `no-namespace` todas en `off`

<a name="jest-config"></a>

### Jest config

Exporta la función `jestConfig()` que retorna una configuración Jest completa con cobertura, reportes y umbrales de calidad.

> ⚠️ **Requisito**: `jestConfig()` espera que exista un archivo `jest.setup.ts` en el root del proyecto.
> Sin este archivo, la suite de tests fallará al intentar cargarlo. El archivo puede estar vacío, pero debe existir.

```typescript
// jest.config.ts
import { jestConfig } from '@tresdoce-nestjs-toolkit/commons';
import type { Config } from 'jest';
import * as dotenv from 'dotenv';

process.env.NODE_ENV = 'test';

dotenv.config({
  path: '.env.test',
});

const config: Config = {
  ...jestConfig(),
  // Descomentar si el proyecto tiene setup/teardown global:
  // globalSetup: './jest.globalSetup.ts',
  // globalTeardown: './jest.globalTeardown.ts',
};

export default config;
```

#### Cobertura mínima

Por defecto, `jestConfig()` exige una cobertura mínima del **80%** en branches, functions, lines y statements.
Este umbral puede ajustarse con el parámetro `minCoveragePercent`:

```typescript
const config: Config = {
  ...jestConfig({ minCoveragePercent: 90 }),
};
```

El valor de `minCoveragePercent` está limitado entre `minCoverageValue` (80) y `maxCoverageValue` (100).
Cualquier valor fuera de ese rango se clampea al límite correspondiente:

```typescript
import { minCoverageValue, maxCoverageValue } from '@tresdoce-nestjs-toolkit/commons';

console.log(minCoverageValue); // 80
console.log(maxCoverageValue); // 100

jestConfig({ minCoveragePercent: 0 }); // se aplica 80 (mínimo)
jestConfig({ minCoveragePercent: 150 }); // se aplica 100 (máximo)
```

#### Características incluidas en la configuración de Jest

- **Transform**: `ts-jest` para archivos `.ts` y `.js`
- **Roots**: `<rootDir>/test/` y `<rootDir>/src/`
- **Test regex**: `*.spec.ts`, `*.it.ts`, `*.test.ts`, `*.e2e.ts`, `*.e2e-spec.ts`
- **Setup**: carga `./jest.setup.ts` y `jest-extended/all` después de cada suite
- **Coverage reporters**: html, text, text-summary, cobertura, clover, json, lcov
- **Reporters**: `default` + `jest-junit` (con salida compatible con CI)
- **Results processor**: `jest-sonar-reporter` (compatible con SonarQube/SonarCloud)
- **Display name**: toma el valor de `npm_package_name` del entorno

<a name="webpack-config"></a>

### Webpack config (aplicaciones NestJS estándar)

Para usar la configuración webpack estándar incluida directamente desde `nest-cli.json`:

```json
// ./nest-cli.json
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

Esta configuración:

- Entry: `./src/main.ts`
- Target: `node`
- Externals: `webpack-node-externals` (excluye `node_modules` del bundle)
- Modo: `development` por defecto, `production` cuando `NODE_ENV=build`
- Optimización en modo production: minificación con Terser, `drop_console: true`
- Source maps: habilitados en development, deshabilitados en production

<a name="cli-starter-webpack-config"></a>

### CLI Starter Webpack config

Para proyectos CLI (herramientas de línea de comandos) se provee una configuración webpack especializada que
inyecta automáticamente el **shebang** `#!/usr/bin/env node` al inicio del archivo de salida:

```json
// ./nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "webpack": true,
    "webpackConfigPath": "./node_modules/@tresdoce-nestjs-toolkit/commons/dist-src/build-config/cli-starter/webpack.config.js"
  }
}
```

Esta configuración extiende la webpack estándar y agrega el plugin `InjectShebangPlugin`. A diferencia de la
configuración estándar, en modo production **no elimina** los `console.log` (`drop_console: false`).

#### `InjectShebangPlugin`

Plugin de webpack que inyecta una línea shebang al inicio del archivo de salida compilado, necesario para que
un script Node.js se ejecute directamente desde la terminal.

```typescript
import { InjectShebangPlugin } from '@tresdoce-nestjs-toolkit/commons/dist-src/build-config/cli-starter/plugins/inject-shebang.plugin';

// Dentro de webpack.config.js:
plugins: [
  new InjectShebangPlugin({
    filename: 'main.js',          // default: 'main.js'
    shebang: '#!/usr/bin/env node', // default: '#!/usr/bin/env node'
  }),
],
```

| Opción     | Tipo     | Default                 | Descripción                                             |
| ---------- | -------- | ----------------------- | ------------------------------------------------------- |
| `filename` | `string` | `'main.js'`             | Nombre del archivo de salida al que inyectar el shebang |
| `shebang`  | `string` | `'#!/usr/bin/env node'` | Línea shebang a inyectar                                |

El plugin es idempotente: si el shebang ya está presente al inicio del archivo, no lo duplica.

<a name="buildconfig"></a>

### buildConfig

Función para crear una configuración webpack personalizada que se fusiona con la configuración base usando
`webpack-merge`.

```typescript
// ./webpack.config.js
const { buildConfig } = require('@tresdoce-nestjs-toolkit/commons');

module.exports = (options) => {
  const additionalConfig = {
    entry: './src/serverless.ts', // sobreescribe el entry point por defecto
  };

  return buildConfig(additionalConfig);
};
```

#### Deshabilitar la externalización de node_modules

Por defecto, `buildConfig` excluye los módulos de `node_modules` del bundle (usando `webpack-node-externals`).
Para proyectos serverless u otros casos donde se necesite incluirlos en el bundle:

```typescript
module.exports = (options) => {
  return buildConfig({ entry: './src/serverless.ts' }, { externalizeNodeModules: false });
};
```

#### Firma

```typescript
buildConfig(
  additionalConfig?: object,                         // Configuración webpack adicional a fusionar
  options?: { externalizeNodeModules: boolean },     // Default: { externalizeNodeModules: true }
): webpack.Configuration
```

| Parámetro                        | Tipo      | Default | Descripción                                                               |
| -------------------------------- | --------- | ------- | ------------------------------------------------------------------------- |
| `additionalConfig`               | `object`  | `{}`    | Configuración webpack que se fusiona sobre la base con `webpack-merge`    |
| `options.externalizeNodeModules` | `boolean` | `true`  | Si es `false`, incluye `node_modules` en el bundle (útil para serverless) |

El modo de compilación se determina por `NODE_ENV`:

- `NODE_ENV=build` → modo `production` (minificación habilitada con Terser, `drop_console: true`)
- Cualquier otro valor → modo `development` (sin minificación, con source maps)

---

<a name="api-reference"></a>

## 📖 API Reference

### Funciones exportadas

| Función                                    | Módulo            | Descripción                                                     |
| ------------------------------------------ | ----------------- | --------------------------------------------------------------- |
| `eslintConfig()`                           | `eslint-config`   | Retorna la configuración ESLint base del toolkit                |
| `jestConfig(opts?)`                        | `testing-library` | Retorna la configuración Jest completa con cobertura y reportes |
| `buildConfig(additionalConfig?, options?)` | `build-config`    | Genera configuración webpack fusionada con la base              |

### Constantes exportadas

| Constante          | Valor | Descripción                          |
| ------------------ | ----- | ------------------------------------ |
| `minCoverageValue` | `80`  | Umbral mínimo de cobertura permitido |
| `maxCoverageValue` | `100` | Umbral máximo de cobertura permitido |

### Clases exportadas

| Clase                 | Path                                   | Descripción                                                      |
| --------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| `InjectShebangPlugin` | `build-config/cli-starter/plugins/...` | Plugin de webpack que inyecta el shebang en el archivo de salida |

### Interfaces internas

| Interfaz           | Descripción                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `IJestConfigProps` | `{ minCoveragePercent?: number }` — parámetros de `jestConfig()` |

---

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
