<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.19.3&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.4.2&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.6&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/>
    <img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg" alt="lerna">
    <a href="./license.md">
        <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
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

Este toolkit está pensada para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

<br>
<div>
    <a href="https://www.buymeacoffee.com/rudemex" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 40px !important;" ></a>
</div>

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [💻 Scripts](#scripts)
- [🧰 Toolkit](#toolkit)
- [📤 Commits](#commits)
- [📜 License MIT](license.md)
<!-- - [📊 Test Reports](https://tresdoce.github.io/tresdoce-nestjs-toolkit/mochawesome-report) -->

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v20.19.3 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.4.2
- NestJS v11.1.6 or higher ([Documentación](https://nestjs.com/))
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
el [NestJS Starter](https://github.com/rudemex/nestjs-starter), siguiendo los lineamientos de `schematics`.

> ⚠️ Es recomendable utilizar las versiones `stables`, ya que las versiones `beta` están pensadas para ser utilizadas a modo de testing y pueden generar conflictos en el código.

| Package                                                                  | Descripción                                                    | Versión                                                                                                                                                         | Changelog                                            |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/archetype`](./packages/archetype)             | Módulo informativo de la app                                   | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/archetype.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/archetype)             | [Changelog](./packages/archetype/CHANGELOG.md)       |
| [`@tresdoce-nestjs-toolkit/aws-sqs`](./packages/aws-sqs)                 | Módulo de cola de mensajes de AWS Simple Queue Service         | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/aws-sqs.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/aws-sqs)                 | [Changelog](./packages/aws-sqs/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/camunda`](./packages/camunda)                 | Módulo de procesos BPMN con Camunda                            | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/camunda.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/camunda)                 | [Changelog](./packages/camunda/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/commons`](./packages/commons)                 | Centralización de configuraciones                              | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/commons.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/commons)                 | [Changelog](./packages/commons/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/core`](./packages/core)                       | Funcionalidades a nivel core                                   | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/core.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/core)                       | [Changelog](./packages/core/CHANGELOG.md)            |
| [`@tresdoce-nestjs-toolkit/dynamoose`](./packages/dynamoose)             | Módulo de base de datos DynamoDB - Dynamoose                   | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/dynamoose.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/dynamoose)             | [Changelog](packages/dynamoose/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/elk`](./packages/elk)                         | Módulo de ElasticSearch Stack                                  | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/elk.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/elk)                         | [Changelog](./packages/elk/CHANGELOG.md)             |
| [`@tresdoce-nestjs-toolkit/filters`](./packages/filters)                 | Librería para filtrar y formatear las excepciones              | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/filters.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/filters)                 | [Changelog](./packages/filters/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/health`](./packages/health)                   | Módulo health checks liveness y readiness                      | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/health.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/health)                   | [Changelog](./packages/health/CHANGELOG.md)          |
| [`@tresdoce-nestjs-toolkit/http-client`](./packages/http-client)         | Módulo http request con axios y axios-retry                    | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/http-client.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/http-client)         | [Changelog](./packages/http-client/CHANGELOG.md)     |
| [`@tresdoce-nestjs-toolkit/mailer`](./packages/mailer)                   | Módulo para envíos de mail                                     | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/mailer.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/mailer)                   | [Changelog](./packages/mailer/CHANGELOG.md)          |
| [`@tresdoce-nestjs-toolkit/paas`](./packages/paas)                       | Librería centralizada de funcionalidades cross                 | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/paas.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/paas)                       | [Changelog](./packages/paas/CHANGELOG.md)            |
| [`@tresdoce-nestjs-toolkit/qrcode`](./packages/qrcode)                   | Módulo para crear códigos QR                                   | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/qrcode.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/qrcode)                   | [Changelog](./packages/qrcode/CHANGELOG.md)          |
| [`@tresdoce-nestjs-toolkit/rate-limit`](./packages/rate-limit)           | Módulo para limitar los requests por segundo a los controllers | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/rate-limit.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/rate-limit)           | [Changelog](./packages/rate-limit/CHANGELOG.md)      |
| [`@tresdoce-nestjs-toolkit/redis`](./packages/redis)                     | Módulo de Redis para cache                                     | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/redis.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/redis)                     | [Changelog](./packages/redis/CHANGELOG.md)           |
| [`@tresdoce-nestjs-toolkit/response-parser`](./packages/response-parser) | Interceptor de formateo de respuesta                           | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/response-parser.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/response-parser) | [Changelog](./packages/response-parser/CHANGELOG.md) |
| [`@tresdoce-nestjs-toolkit/snowflake-uid`](./packages/snowflake-uid)     | Módulo de SnowFlake ID                                         | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/snowflake-uid.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/snowflake-uid)     | [Changelog](./packages/snowflake-uid/CHANGELOG.md)   |
| [`@tresdoce-nestjs-toolkit/test-utils`](./packages/test-utils)           | Utilities para testing                                         | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/test-utils.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/test-utils)           | [Changelog](./packages/test-utils/CHANGELOG.md)      |
| [`@tresdoce-nestjs-toolkit/tracing`](./packages/tracing)                 | Módulo de traza con OpenTelemetry                              | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/tracing.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/tracing)                 | [Changelog](./packages/tracing/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/typeorm`](./packages/typeorm)                 | Módulo de ORM para base de datos                               | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/typeorm.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/typeorm)                 | [Changelog](./packages/typeorm/CHANGELOG.md)         |
| [`@tresdoce-nestjs-toolkit/utils`](./packages/utils)                     | Utilitarios para proyectos y librerías                         | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/utils.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/utils)                     | [Changelog](./packages/utils/CHANGELOG.md)           |

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

### Ejemplo Commit

```
git commit -m "docs(core): add documentantion to readme core module"
```

### Commit Breaking Change

```
git commit -am 'feat!: changes in application'
```

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤️</p>
</div>
