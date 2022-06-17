<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v8.2.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/>
    <img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna">
    <a href="./license.md">
        <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    </a>
    <br/>
    <a href="https://github.com/tresdoce/tresdoce-nestjs-toolkit/actions/workflows/master.yml" target="_blank">
        <img alt="GitHub Workflow Status" src="https://github.com/tresdoce/tresdoce-nestjs-toolkit/actions/workflows/master.yml/badge.svg?branch=master">
    </a>
    <a href="https://app.codecov.io/gh/tresdoce/tresdoce-nestjs-toolkit/" target="_blank">
        <img alt="Codecov" src="https://img.shields.io/codecov/c/github/tresdoce/tresdoce-nestjs-toolkit?logoColor=FFFFFF&logo=Codecov&labelColor=#F01F7A">
    </a>
    <a href="https://sonarcloud.io/summary/new_code?id=tresdoce_tresdoce-nestjs-toolkit" target="_blank">  
        <img src="https://sonarcloud.io/api/project_badges/measure?project=tresdoce_tresdoce-nestjs-toolkit&metric=alert_status" alt="sonarcloud">
    </a>
    <a href="https://snyk.io/test/github/tresdoce/tresdoce-nestjs-toolkit" target="_blank">
        <img src="https://snyk.io/test/github/tresdoce/tresdoce-nestjs-toolkit/badge.svg" alt="Snyk">
    </a>
    <br/> 
</div>
<br>

Este toolkit está pensada para ser utilizado en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.


## Glosario

- [🥳 Demo](https://rudemex-nestjs-starter.herokuapp.com/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [💻 Scripts](#scripts)
- [🧰 Toolkit](#toolkit)
- [📤 Commits](#commits)
- [📜 License MIT](license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.17 or higher
- NPM v6.14.13 or higher
- NestJS v8.2.6 or higher ([Documentación](https://nestjs.com/))
- Lerna

<a name="scripts"></a>

## 💻 Scripts

Instalar Lerna

```
npm i -g lerna
```

Instalar dependencias del monorepo

```
yarn install
```

Crear paquetes

```
yarn plop
```

Transpilar paquetes

```
yarn build
```

Test paquetes

```
yarn test
```

<a name="toolkit"></a>

## 🧰 Toolkit

Los módulos de la siguiente lista, están pensados para ser consumidos por
el [NestJs Starter](https://github.com/rudemex/nestjs-starter), siguiendo los lineamientos de `schematics`.

| Package                                                                  | Descripción                                       | Versión                                                                                                                                                         | Changelog                                            |
|--------------------------------------------------------------------------|---------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| [`@tresdoce-nestjs-toolkit/archetype`](./packages/archetype)             | Módulo informativo de la app                      | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/archetype.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/archetype)             | [Changelog](./packages/archetype/CHANGELOG.md)       |
| [`@tresdoce-nestjs-toolkit/commons`](./packages/commons)                 | Centralización de configuraciones                 | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/commons.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/commons)                 | [Changelog](./packages/commons/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/core`](./packages/core)                       | Funcionalidades a nivel core                      | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/core.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/core)                       | [Changelog](./packages/core/CHANGELOG.md)            |
| [`@tresdoce-nestjs-toolkit/filters`](./packages/filters)                 | Librería para filtrar y formatear las excepciones | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/filters.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/filters)                 | [Changelog](./packages/filters/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/health`](./packages/health)                   | Módulo health checks liveness y readiness         | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/health.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/health)                   | [Changelog](./packages/health/CHANGELOG.md)          |
| [`@tresdoce-nestjs-toolkit/http-client`](./packages/http-client)         | Módulo http request con axios y axios-retry       | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/http-client.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/http-client)         | [Changelog](./packages/http-client/CHANGELOG.md)     |
| [`@tresdoce-nestjs-toolkit/test-utils`](./packages/test-utils)           | Utilities para testing                            | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/test-utils.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/test-utils)           | [Changelog](./packages/test-utils/CHANGELOG.md)      |
| [`@tresdoce-nestjs-toolkit/typeorm`](./packages/typeorm)                 | Módulo de ORM para base de datos                  | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/typeorm.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/typeorm)                 | [Changelog](./packages/typeorm/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/response-parser`](./packages/response-parser) | Interceptor de formateo de respuesta              | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/response-parser.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/response-parser) | [Changelog](./packages/response-parser/CHANGELOG.md) |
| [`@tresdoce-nestjs-toolkit/redis`](./packages/redis) | Módulo de Redis para cache | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/redis.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/redis) | [Changelog](./packages/redis/CHANGELOG.md) |
<!---PLOP-TOOLKIT-TABLE-->

<a name="commits"></a>

## 📤 Commits

Para los mensajes de commits se toma como
referencia [`conventional commits`](https://www.conventionalcommits.org/es/v1.0.0/#resumen).

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

- **type:** chore, docs, feat, fix, refactor, test (más comunes)
- **scope:** indica la página, componente, funcionalidad
- **description:** comienza en minúsculas y no debe superar los 72 caracteres.

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="./.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
