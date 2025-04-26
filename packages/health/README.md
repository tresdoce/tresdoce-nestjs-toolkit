<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Health</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.19.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.2.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.0&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/health.svg">
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
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v20.19.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v11.2.0 or higher
- NestJS v11.1.0 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/health
```

```
yarn add @tresdoce-nestjs-toolkit/health
```

<a name="configurations"></a>

## ⚙️ Configuración

El módulo tiene la capacidad de utilizar la configuración centralizada para poder realizar los health checks
correspondientes a los servicios configurados.

Siguiendo la arquitectura del [NestJS Starter](https://github.com/rudemex/nestjs-starter), la información que se agrega
en la configuración de los `services` impacta en los health checks para él `readiness`, como
asi también el uso de ciertos servicios como `elasticsearch`, `typeORM`, `Redis`, `Camunda`, etc.

Utilizando la propiedad `timeout` para configurar el tiempo de respuesta del servicio, como también la
propiedad `healthPath` para configurar la `url` a la cual realizar el ping check, si no se completa este campo, por
defecto realiza el ping al dominio de la url.

```typescript
//./src/config/configuration.ts
import { getSkipHealthChecks, Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    health: {
      skipChecks: getSkipHealthChecks(process.env.SKIP_HEALTH_CHECKS),
    },
    services: {
      myApi: {
        url: process.env.MY_API_URL,
      },
      myApiTwo: {
        url: process.env.MY_API_TWO_URL,
        timeout: 5000,
        healthPath: '/health/endpoint/of/api',
      },
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

### Health

`skipChecks`: Lista de servicios predefinida por arquitectura para skipear los ping checks del readiness,
si no se requiere realizar un skipeo, lo recomendable es remover la variable y su configuración.

- Type: `String[]`
- Values: `storage | memory | elasticsearch | redis | camunda | typeorm`
- Example: `elasticsearch,memory`

### Services

`timeout`: Es tiempo de respuesta del servicio a consumir.

- Type: `Number`
- Default: `0`

`healthPath`: Endpoint a realizar el ping check del servicio

- Type: `String`
- Default: `/health/liveness`

</details>

<a name="use"></a>

## 👨‍💻 Uso

Importar `healthModule` en módulo principal de nuestra aplicación.

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

Para visualizar las respuestas de los endpoints, basta con navegar a `/health/liveness` y `/health/readiness`.

### Liveness

**Schema:** `<http|https>://<server_url><:port>/<app-context>/health/liveness`<br/>
**Example:** `http://localhost:8080/v1/health/liveness`

#### Response

```json
{
  "status": "up"
}
```

### Readiness

**Schema:** `<http|https>://<server_url><:port>/<app-context>/health/readiness`<br/>
**Example:** `http://localhost:8080/v1/health/readiness`

#### Response

```json
{
  "status": "ok",
  "info": {
    "myApi": {
      "status": "up"
    },
    "myApiTwo": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "myApi": {
      "status": "up"
    },
    "myApiTwo": {
      "status": "up"
    }
  }
}
```

```json
{
  "status": "error",
  "info": {
    "myApi": {
      "status": "up"
    }
  },
  "error": {
    "myApiTwo": {
      "status": "down",
      "message": "connect ECONNREFUSED myApiTwo.example.com"
    }
  },
  "details": {
    "myApi": {
      "status": "up"
    },
    "myApiTwo": {
      "status": "down",
      "message": "connect ECONNREFUSED myApiTwo.example.com"
    }
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
