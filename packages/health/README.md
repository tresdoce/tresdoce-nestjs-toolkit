<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Health</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/health.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este módulo se encuentra implementado en el package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📋 API Reference](#api-reference)
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
npm install -S @tresdoce-nestjs-toolkit/health
```

```
yarn add @tresdoce-nestjs-toolkit/health
```

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                          | Razón                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core)       | Tipos `Typings.AppConfig`, decoradores base y utilidades comunes |
| [`@tresdoce-nestjs-toolkit/tracing`](../tracing) | Decorador `@SkipTrace` y contexto de OpenTelemetry               |

<a name="configurations"></a>

## ⚙️ Configuración

El módulo utiliza la configuración centralizada para ejecutar los health checks correspondientes a los servicios configurados.

Siguiendo la arquitectura del [NestJS Starter](https://github.com/rudemex/nestjs-starter), la información agregada en `health` y `services` impacta directamente en el endpoint `/health/readiness`, así como también la presencia de configuraciones de `elasticsearch`, `typeorm`, `redis` y `camunda`.

```typescript
//./src/config/configuration.ts
import { getSkipHealthChecks, Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    health: {
      skipChecks: getSkipHealthChecks(process.env.SKIP_HEALTH_CHECKS),
      storage: {
        path: '/',
        thresholdPercent: 0.9,
      },
      memory: {
        heap: 300 * 1024 * 1024, // 300 MB en bytes
        rss: 300 * 1024 * 1024, // 300 MB en bytes
      },
    },
    services: {
      myApi: {
        url: process.env.MY_API_URL,
      },
      myApiTwo: {
        url: process.env.MY_API_TWO_URL,
        timeout: 5000,
        healthPath: '/health/liveness',
      },
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

### Health

`skipChecks`: Lista de checks a omitir en el readiness. Si no se requiere omitir ninguno, se recomienda remover la variable y su configuración.

- Type: `String[]`
- Values: `storage | memory | elasticsearch | redis | camunda | typeorm`
- Example: `elasticsearch,memory`

`storage`: Configuración para el check de disco mediante `DiskHealthIndicator.checkStorage()`.

| Propiedad          | Type     | Description                                                                              |
| ------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `path`             | `string` | Ruta del sistema de archivos a monitorear (ej: `'/'` en Linux, `'C:\\'` en Windows).     |
| `thresholdPercent` | `number` | Porcentaje máximo de uso de disco permitido, entre `0` y `1`. Ej: `0.9` equivale al 90%. |

`memory`: Configuración para los checks de memoria mediante `MemoryHealthIndicator`.

| Propiedad | Type     | Description                                                                   |
| --------- | -------- | ----------------------------------------------------------------------------- |
| `heap`    | `number` | Límite en **bytes** para el uso del heap de Node.js (`checkHeap`).            |
| `rss`     | `number` | Límite en **bytes** para el RSS (Resident Set Size) del proceso (`checkRSS`). |

### Services

`timeout`: Tiempo máximo de respuesta del servicio en milisegundos.

- Type: `Number`
- Default: `0`

`healthPath`: Endpoint al cual se realiza el ping check del servicio. Si no se especifica, se usa el path por defecto.

- Type: `String`
- Default: `/health/liveness`

</details>

### Checks automáticos por configuración

El módulo agrega checks automáticamente al readiness si detecta las siguientes claves en la configuración centralizada:

| Configuración presente    | Check agregado                              | Key de resultado en readiness |
| ------------------------- | ------------------------------------------- | ----------------------------- |
| `config.database.typeorm` | Ping a TypeORM con `TypeOrmHealthIndicator` | `typeorm-<type>`              |
| `config.redis`            | Ping a Redis vía microservicio              | `redis` o `redis-<name>`      |
| `config.elasticsearch`    | Ping HTTP al nodo de Elasticsearch          | `elasticsearch`               |
| `config.camunda`          | Ping HTTP a `<camunda.baseUrl>/version`     | `camunda`                     |

Cada uno de estos checks puede omitirse individualmente usando `health.skipChecks`.

<a name="use"></a>

## 👨‍💻 Uso

Importar `HealthModule` en el módulo principal de la aplicación.

```typescript
//./src/app.module.ts
import { HealthModule } from '@tresdoce-nestjs-toolkit/health';

@Module({
  imports: [
    //...
    HealthModule,
    //...
  ],
  //...
})
export class AppModule {}
```

Para visualizar las respuestas de los endpoints, navegar a `/health/liveness` y `/health/readiness`.

### Liveness

**Schema:** `<http|https>://<server_url><:port>/<app-context>/health/liveness`<br/>
**Example:** `http://localhost:8080/v1/health/liveness`

El endpoint de liveness verifica que el proceso de Node.js está en ejecución. No depende de servicios externos.

#### Response

```json
{
  "status": "up"
}
```

### Readiness

**Schema:** `<http|https>://<server_url><:port>/<app-context>/health/readiness`<br/>
**Example:** `http://localhost:8080/v1/health/readiness`

El endpoint de readiness ejecuta todos los health checks configurados. Las claves de cada servicio en `services` aparecen con el prefijo `service-` en la respuesta.

#### Response exitosa

```json
{
  "status": "ok",
  "info": {
    "service-myApi": {
      "status": "up"
    },
    "service-myApiTwo": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "service-myApi": {
      "status": "up"
    },
    "service-myApiTwo": {
      "status": "up"
    }
  }
}
```

#### Response con error

```json
{
  "status": "error",
  "info": {
    "service-myApi": {
      "status": "up"
    }
  },
  "error": {
    "service-myApiTwo": {
      "status": "down",
      "message": "connect ECONNREFUSED myApiTwo.example.com"
    }
  },
  "details": {
    "service-myApi": {
      "status": "up"
    },
    "service-myApiTwo": {
      "status": "down",
      "message": "connect ECONNREFUSED myApiTwo.example.com"
    }
  }
}
```

#### Response con checks adicionales (storage, memory, typeorm)

```json
{
  "status": "ok",
  "info": {
    "storage": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "typeorm-postgres": {
      "status": "up"
    },
    "service-myApi": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "storage": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    },
    "typeorm-postgres": {
      "status": "up"
    },
    "service-myApi": {
      "status": "up"
    }
  }
}
```

### Excluir rutas de salud en middlewares

Para evitar que los middlewares globales (autenticación, logging, etc.) intercepten las rutas de health, se puede usar el array `controllersExcludes` exportado por el módulo:

```typescript
//./src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthModule, controllersExcludes } from '@tresdoce-nestjs-toolkit/health';
import { SomeMiddleware } from './some.middleware';

@Module({
  imports: [HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SomeMiddleware)
      .exclude(...controllersExcludes)
      .forRoutes('*');
  }
}
```

El array `controllersExcludes` contiene las rutas `GET /health/liveness` y `GET /health/readiness`.

<a name="api-reference"></a>

## 📋 API Reference

### Constantes exportadas

| Constante                       | Valor                | Descripción                                                                                |
| ------------------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| `DEFAULT_SERVICE_LIVENESS_PATH` | `'/health/liveness'` | Path por defecto usado en el ping check de servicios cuando no se especifica `healthPath`. |
| `controllersExcludes`           | `RouteInfo[]`        | Array con las rutas de liveness y readiness, útil para excluirlas de middlewares globales. |

### HealthModule

Módulo global que registra los controllers de liveness y readiness, e inyecta la configuración centralizada mediante el token `CONFIG_OPTIONS`.

### Endpoints

| Método | Ruta                | Descripción                                         |
| ------ | ------------------- | --------------------------------------------------- |
| `GET`  | `/health/liveness`  | Retorna `{ status: 'up' }` si el proceso está vivo. |
| `GET`  | `/health/readiness` | Ejecuta todos los health checks configurados.       |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
