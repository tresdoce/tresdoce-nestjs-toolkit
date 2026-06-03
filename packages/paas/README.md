<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Paas</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/paas.svg">
    <br/>
</div>
<br/>

Esta librería está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
- [📦 Paquetes re-exportados](#packages)
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
npm install -S @tresdoce-nestjs-toolkit/paas
```

```
yarn add @tresdoce-nestjs-toolkit/paas
```

<a name="internal-dependencies"></a>

## 📦 Dependencias internas

Este paquete re-exporta los siguientes paquetes del toolkit:

| Paquete                                                          | Razón                                                            |
| ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core)                       | Tipos `Typings.AppConfig`, decoradores base y utilidades comunes |
| [`@tresdoce-nestjs-toolkit/filters`](../filters)                 | Función `buildErrorPayload` y tipos de error normalizados        |
| [`@tresdoce-nestjs-toolkit/health`](../health)                   | Endpoints `/health/liveness` y `/health/readiness`               |
| [`@tresdoce-nestjs-toolkit/rate-limit`](../rate-limit)           | Throttling de requests vía `RateLimitModule`                     |
| [`@tresdoce-nestjs-toolkit/response-parser`](../response-parser) | Interceptor `ResponseInterceptor` para formateo de respuestas    |
| [`@tresdoce-nestjs-toolkit/tracing`](../tracing)                 | Decorador `@SkipTrace` y contexto de OpenTelemetry               |
| [`@tresdoce-nestjs-toolkit/utils`](../utils)                     | Servicios `FormatService`, `RedactService` y `BcryptService`     |

<a name="use"></a>

## 👨‍💻 Uso

`@tresdoce-nestjs-toolkit/paas` es una librería **de re-exportación centralizada** que agrupa en un único punto de
entrada todos los paquetes esenciales para construir aplicaciones con el NestJS Starter. Al instalar `paas`, obtienes
acceso directo a todos sus símbolos sin necesidad de instalar cada paquete por separado.

```typescript
// Importar desde un único punto de entrada
import {
  // desde @tresdoce-nestjs-toolkit/core
  Typings,
  CsrfMiddleware,
  // desde @tresdoce-nestjs-toolkit/filters
  ExceptionsFilter,
  // desde @tresdoce-nestjs-toolkit/health
  HealthModule,
  // desde @tresdoce-nestjs-toolkit/response-parser
  ResponseInterceptor,
  // desde @tresdoce-nestjs-toolkit/tracing
  TracingModule,
  TracingService,
  TracingInterceptor,
  // desde @tresdoce-nestjs-toolkit/utils
  RedactModule,
  RedactService,
  FormatModule,
  FormatService,
  BcryptModule,
  BcryptService,
} from '@tresdoce-nestjs-toolkit/paas';
```

### Ejemplo en AppModule

```typescript
// ./src/app.module.ts
import {
  HealthModule,
  ExceptionsFilter,
  ResponseInterceptor,
  TracingModule,
  RedactModule,
  FormatModule,
  BcryptModule,
} from '@tresdoce-nestjs-toolkit/paas';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [HealthModule, TracingModule, RedactModule, FormatModule, BcryptModule],
  providers: [
    { provide: APP_FILTER, useClass: ExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
```

<a name="packages"></a>

## 📦 Paquetes re-exportados

`@tresdoce-nestjs-toolkit/paas` re-exporta íntegramente los siguientes paquetes. Para conocer la configuración
detallada de cada uno, referirse a su README correspondiente:

| Paquete                                    | Descripción                                                                   | README                         |
| ------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------ |
| `@tresdoce-nestjs-toolkit/core`            | Funcionalidades a nivel core: typings, decoradores, validaciones, middlewares | [Ver docs](../core)            |
| `@tresdoce-nestjs-toolkit/filters`         | Filtro global de excepciones HTTP                                             | [Ver docs](../filters)         |
| `@tresdoce-nestjs-toolkit/health`          | Health check endpoints con `@nestjs/terminus`                                 | [Ver docs](../health)          |
| `@tresdoce-nestjs-toolkit/response-parser` | Interceptor para estandarizar la estructura de respuestas                     | [Ver docs](../response-parser) |
| `@tresdoce-nestjs-toolkit/tracing`         | Tracing distribuido con OpenTelemetry                                         | [Ver docs](../tracing)         |
| `@tresdoce-nestjs-toolkit/utils`           | Utilidades: Redact, Format, Bcrypt                                            | [Ver docs](../utils)           |

### Resumen de símbolos disponibles por sub-paquete

#### `@tresdoce-nestjs-toolkit/core`

- **Namespace**: `Typings` — tipos y tipados de la aplicación (`AppConfig`, etc.)
- **Commons**: utilidades y helpers a nivel core
- **Decoradores**: decoradores reutilizables
- **Validaciones**: helpers de validación con Joi

#### `@tresdoce-nestjs-toolkit/filters`

- `ExceptionsFilter` — filtro global de excepciones HTTP
- Constantes y tipos de errores

#### `@tresdoce-nestjs-toolkit/health`

- `HealthModule` — módulo de health checks

#### `@tresdoce-nestjs-toolkit/response-parser`

- `ResponseInterceptor` — interceptor para estandarizar respuestas

#### `@tresdoce-nestjs-toolkit/tracing`

- `TracingModule` — módulo de tracing con OpenTelemetry
- `TracingService` — servicio de tracing
- `TracingInterceptor` — interceptor de tracing
- Decoradores de tracing

#### `@tresdoce-nestjs-toolkit/utils`

- `RedactModule` / `RedactService` — ofuscamiento de datos sensibles
- `FormatModule` / `FormatService` — formateo de números y fechas
- `BcryptModule` / `BcryptService` — encriptación con bcrypt
- Constantes: `DEFAULT_TIMEZONE`, `DEFAULT_LOCALE`, `DEFAULT_TIMEZONE_LOCALE`, etc.
- Interfaces: `RedactOptions`, `BcryptOptions`, `FormatNumberOptions`, etc.

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
