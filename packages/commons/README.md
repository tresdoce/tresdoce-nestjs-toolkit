<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Commons</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/commons.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Centraliza la configuración de **Vitest** y **oxlint** que comparten los proyectos basados en el starter (Nest 12, ESM).

> Desde esta versión el paquete ya no incluye `eslintConfig()`, `jestConfig()` ni las configuraciones de webpack (`buildConfig`, `InjectShebangPlugin`). Ver [Migración](#migration).

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
  - [Vitest config](#vitest-config)
  - [oxlint preset](#oxlint-preset)
- [🔁 Migración](#migration)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Vitest v5 (peer dependency) y, opcionalmente, oxlint (+ `oxlint-tsgolint` para las reglas type-aware)

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

Este paquete es una **dependencia de desarrollo** (`devDependency`).

```
npm install -D @tresdoce-nestjs-toolkit/commons vitest oxlint oxlint-tsgolint
```

```
yarn add -D @tresdoce-nestjs-toolkit/commons vitest oxlint oxlint-tsgolint
```

`@vitest/coverage-istanbul` y `vitest-sonar-reporter` vienen como dependencias del paquete, no hace falta instalarlos aparte (con gestores estrictos como pnpm puede ser necesario declararlos en el proyecto para que Vitest los resuelva).

Este paquete no lee ninguna key de `Typings.AppConfig` ni variables de entorno: solo aporta configuración de herramientas de desarrollo.

<a name="use"></a>

## 👨‍💻 Uso

<a name="vitest-config"></a>

### Vitest config

`vitestConfig()` devuelve una configuración de Vitest lista para apps NestJS: globals habilitados, entorno `node`, reportes `junit.xml` y `test-report.xml` (SonarQube) y cobertura con istanbul.

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { vitestConfig } from '@tresdoce-nestjs-toolkit/commons';

export default defineConfig(vitestConfig());
```

Opciones:

```typescript
export default defineConfig(
  vitestConfig({
    minCoveragePercent: 90, // default 100, se limita al rango 0-100
    setupFiles: ['./vitest.setup.ts'], // default []
    ignoreDecoratorMetadata: true, // default true
  }),
);
```

Incluye por defecto:

- Tests: `src/**/*.{spec,it,test}.ts` y `test/**/*.{spec,e2e-spec}.ts`.
- `resolve.tsconfigPaths: true`, para los alias de `tsconfig.json`.
- Reporters: `default`, `junit` (`junit.xml`) y `vitest-sonar-reporter` (`test-report.xml`).
- Cobertura con istanbul sobre `src/**/*.ts`, excluyendo `src/main.ts`, `src/**/__test__/**`, entities y `.d.ts` (los archivos de test siempre quedan fuera). Reportes `html`, `text`, `text-summary`, `cobertura`, `clover`, `json` y `lcov` en `./coverage`.
- Plugin `ignoreDecoratorMetadataCoverage()`: el transform de TypeScript de Vite (oxc) convierte los decoradores (`@Injectable()`, `@Controller()`, `@Get()`…) en llamadas `_decorate(...)` con ternarios `typeof X === "undefined" ? Object : X` para la metadata de `design:paramtypes`. Istanbul los cuenta como branches sin cubrir en cada clase decorada, lo que rompe un umbral del 100%. El plugin marca esas sentencias con `/* istanbul ignore next */` para medir solo el código escrito a mano. Se desactiva con `ignoreDecoratorMetadata: false`.

Ejemplo de la salida de cobertura al correr `npx vitest run --coverage`:

```
 ✓ src/app/app.controller.spec.ts (3 tests) 12ms

 Test Files  1 passed (1)
      Tests  3 passed (3)

SonarQube report written to /path/to/app/test-report.xml
JUNIT report written to /path/to/app/junit.xml
 % Coverage report from istanbul
=============================== Coverage summary ===============================
Statements   : 100% ( 18/18 )
Branches     : 100% ( 10/10 )
Functions    : 100% ( 3/3 )
Lines        : 100% ( 14/14 )
================================================================================
```

Para agregar o pisar opciones, combiná con `mergeConfig`:

```typescript
import { defineConfig, mergeConfig } from 'vitest/config';
import { vitestConfig } from '@tresdoce-nestjs-toolkit/commons';

export default mergeConfig(vitestConfig(), defineConfig({ test: { testTimeout: 30_000 } }));
```

<a name="oxlint-preset"></a>

### oxlint preset

El paquete incluye un preset de [oxlint](https://oxc.rs/docs/guide/usage/linter) equivalente a las reglas que tenía `eslintConfig()`:

```json
// .oxlintrc.json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@tresdoce-nestjs-toolkit/commons/oxlint/oxlintrc.json"],
  "ignorePatterns": ["dist/**", "coverage/**"]
}
```

```bash
npx oxlint --type-aware src test
```

Qué configura el preset:

- Plugins: `typescript`, `unicorn`, `oxc`, `import`, `node` y `vitest`; entorno `node` + `es2024`.
- Errores: `typescript/no-require-imports` (ESM only) y `typescript/no-floating-promises` (type-aware).
- Apagadas: `typescript/no-explicit-any`, `typescript/no-namespace`, `typescript/no-empty-function`, `no-unused-vars` (lo cubre `tsc`) y `typescript/no-useless-default-assignment`.
- En tests (`**/__test__/**`, `**/*.spec.ts`, `**/*.e2e-spec.ts`) se apagan `typescript/no-floating-promises`, `typescript/unbound-method` y `vitest/require-mock-type-parameters`.

> oxlint no hereda `ignorePatterns` de un `extends`, por eso se declaran en el `.oxlintrc.json` del proyecto. Las reglas type-aware solo corren con `--type-aware` y requieren `oxlint-tsgolint` instalado.

<a name="migration"></a>

## 🔁 Migración

| Antes                                 | Ahora                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `jestConfig()` en `jest.config.ts`    | `vitestConfig()` en `vitest.config.ts`                                 |
| `eslintConfig()` en `.eslintrc.js`    | `extends` del preset en `.oxlintrc.json`                               |
| `buildConfig()` / webpack del starter | `nest build` con `tsc` (Nest 12 compila ESM sin webpack)               |
| `jest.setup.ts` + `jest-extended`     | `setupFiles` de Vitest; los matchers nativos cubren la mayoría de usos |

<a name="api-reference"></a>

## 📖 API Reference

### Funciones exportadas

| Función                             | Retorno          | Descripción                                                                                                         |
| ----------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `vitestConfig(options?)`            | `ViteUserConfig` | Configuración de Vitest para apps del starter                                                                       |
| `ignoreDecoratorMetadataCoverage()` | `Plugin`         | Plugin de Vite que excluye de la cobertura los `_decorate(...)` generados por oxc (ya incluido en `vitestConfig()`) |

### Constantes exportadas

| Constante              | Valor | Descripción                          |
| ---------------------- | ----- | ------------------------------------ |
| `defaultCoverageValue` | `100` | Umbral de cobertura por defecto      |
| `minCoverageValue`     | `0`   | Umbral mínimo de cobertura permitido |
| `maxCoverageValue`     | `100` | Umbral máximo de cobertura permitido |

### Interfaces

#### `IVitestConfigProps`

| Opción                    | Tipo       | Default | Descripción                                                                  |
| ------------------------- | ---------- | ------- | ---------------------------------------------------------------------------- |
| `minCoveragePercent`      | `number`   | `100`   | Umbral de branches, functions, lines y statements (se limita al rango 0-100) |
| `setupFiles`              | `string[]` | `[]`    | Archivos de setup, relativos a la raíz del proyecto                          |
| `ignoreDecoratorMetadata` | `boolean`  | `true`  | Agrega el plugin `ignoreDecoratorMetadataCoverage()`                         |

### Archivos publicados

| Archivo                | Descripción                              |
| ---------------------- | ---------------------------------------- |
| `oxlint/oxlintrc.json` | Preset de oxlint para usar con `extends` |

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
