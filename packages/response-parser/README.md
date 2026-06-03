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

Interceptor global que normaliza el formato de las respuestas HTTP y permite propagar headers de la request a la response. Está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter) o en cualquier proyecto que siga la misma arquitectura de configuración centralizada.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [🖥 Respuesta](#response)
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

```
npm install -S @tresdoce-nestjs-toolkit/response-parser
```

```
yarn add @tresdoce-nestjs-toolkit/response-parser
```

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                          | Razón                                                     |
| ------------------------------------------------ | --------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/filters`](../filters) | Función `buildErrorPayload` y tipos de error normalizados |

<a name="configurations"></a>

## ⚙️ Configuración

### Registrar el interceptor

Para utilizar este interceptor, registrarlo como provider global en el módulo principal (`AppModule`):

```typescript
// ./src/app.module.ts
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

> `ResponseInterceptor` usa internamente `ConfigService` para leer la configuración de `propagateHeaders`. Por eso, `ConfigModule` debe estar disponible globalmente (`isGlobal: true`) antes de que el interceptor sea instanciado.

### Propagación de Headers

Para propagar headers de la request a la response, configurar la propiedad `server.propagateHeaders` en la configuración centralizada de la app. El interceptor lee esta lista desde `config.server.propagateHeaders`.

```typescript
// ./src/config/configuration.ts
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
# .env
PROPAGATE_HEADERS=x-request-id,x-correlation-id,x-custom-header
```

| Propiedad de configuración       | Tipo       | Descripción                                                                                                                                 |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `config.server.propagateHeaders` | `string[]` | Lista de nombres de headers (en minúsculas) que se copian de la request a la response. Si no está configurado, no se propaga ningún header. |

El interceptor hace la comparación de headers en minúsculas (`headerName.trim().toLowerCase()`), por lo que los nombres son case-insensitive.

<a name="response"></a>

## 🖥 Respuesta

### Lógica de transformación

El interceptor aplica la siguiente regla sobre el valor retornado por el controller:

- Si el valor es un **array**, lo envuelve en un objeto `{ data: [...] }`.
- Si el valor **no** es un array (objeto, primitivo, etc.), lo pasa sin modificaciones.

Esta normalización evita que los controllers de colecciones retornen arrays desnudos, lo cual facilita la extensión futura de la respuesta (e.g., agregar metadata de paginación).

### Respuesta de entidad única

Si el controller retorna un objeto, la respuesta se mantiene tal cual:

```json
{
  "id": 1,
  "name": "juan",
  "lastname": "perez"
}
```

### Respuesta de colección (array)

Si el controller retorna un array, el interceptor lo envuelve automáticamente en `{ data: [...] }`:

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
  ]
}
```

### Respuesta con headers propagados

Cuando `PROPAGATE_HEADERS` está configurado y la request incluye esos headers, el interceptor los copia en la response automáticamente. Por ejemplo, si la request trae `x-request-id: abc-123` y ese header está en la lista, la response también incluirá `x-request-id: abc-123`.

<a name="api-reference"></a>

## 📖 API Reference

### `ResponseInterceptor<T>`

|                  |                                                   |
| ---------------- | ------------------------------------------------- |
| **Tipo**         | `NestInterceptor`                                 |
| **Registro**     | Como `APP_INTERCEPTOR` global en `AppModule`.     |
| **Dependencias** | `ConfigService` (requiere `ConfigModule` global). |

#### Comportamiento

1. Lee `config.server.propagateHeaders` del `ConfigService`.
2. Por cada header de la lista, si está presente en la request, lo setea en la response.
3. Transforma el valor retornado por el handler: si es un array, lo envuelve en `{ data: value }`; si no, lo retorna sin cambios.

#### Configuración vía `ConfigService`

| Clave de configuración           | Tipo       | Default                    | Descripción                                     |
| -------------------------------- | ---------- | -------------------------- | ----------------------------------------------- |
| `config.server.propagateHeaders` | `string[]` | `[]` (si no está definido) | Headers a propagar de la request a la response. |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
