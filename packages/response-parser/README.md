<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Response-Parser</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/response-parser.svg">
    <br/>
</div>
<br/>

Interceptor que normaliza el formato de las respuestas HTTP (envuelve los arrays en `{ data: [...] }`) y propaga headers de la request a la response según la configuración centralizada. Está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter) o en cualquier proyecto que siga la misma arquitectura de configuración centralizada (`registerAs('config', ...)`).

**¿Cuándo usarlo?**

- Cuando querés que los endpoints de colecciones nunca devuelvan un array desnudo, para poder agregar metadata (paginación, totales) más adelante sin romper el contrato.
- Cuando necesitás devolver al cliente headers de correlación que llegaron en la request (`x-request-id`, `x-correlation-id`, etc.).

> También se re-exporta desde `@tresdoce-nestjs-toolkit/paas`.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [🖥 Respuestas](#response)
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
- `@nestjs/config` v12 con `ConfigModule` registrado como global (`isGlobal: true`)
- Proyecto ESM (`"type": "module"`): el paquete se publica sólo como ESM.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/response-parser
```

```
yarn add @tresdoce-nestjs-toolkit/response-parser
```

Este paquete no depende de otros paquetes del toolkit ni de servicios externos.

<a name="configurations"></a>

## ⚙️ Configuración

### Propagación de headers

El interceptor lee la key `config.server.propagateHeaders` (`Typings.AppConfig['server']['propagateHeaders']`) del `ConfigService`. Es opcional: si no está definida, no se propaga ningún header.

```typescript
// ./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => ({
  //...
  server: {
    //...
    propagateHeaders: process.env.PROPAGATE_HEADERS ? process.env.PROPAGATE_HEADERS.split(',') : [],
  },
  //...
}));
```

```dotenv
# .env
PROPAGATE_HEADERS=x-request-id,x-correlation-id,x-custom-header
```

| Variable de entorno | Ejemplo                         | Descripción                                                  |
| ------------------- | ------------------------------- | ------------------------------------------------------------ |
| `PROPAGATE_HEADERS` | `x-request-id,x-correlation-id` | Lista separada por comas de headers a copiar en la response. |

Reglas de la lista:

- Cada nombre se normaliza con `trim()` + `toLowerCase()`, por lo que es case-insensitive y tolera espacios (`' X-Request-Id '` → `x-request-id`).
- También se acepta un `string` separado por comas (por ejemplo, si se pasa `process.env.PROPAGATE_HEADERS` sin `split`).
- Los nombres vacíos se ignoran, y un header sólo se copia si viene en la request con un valor no vacío.
- Los headers multivalor (`string[]`) se copian tal cual.

<a name="use"></a>

## 👨‍💻 Uso

### Registro global (recomendado)

```typescript
// ./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '@tresdoce-nestjs-toolkit/response-parser';
import config from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] })],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
```

> `ResponseInterceptor` inyecta `ConfigService`, por eso debe registrarse vía DI (`APP_INTERCEPTOR`). Si usás `app.useGlobalInterceptors(...)` en el `main.ts`, pasale la instancia: `app.useGlobalInterceptors(new ResponseInterceptor(app.get(ConfigService)))`.

### Registro por controller o por handler

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ResponseInterceptor } from '@tresdoce-nestjs-toolkit/response-parser';

@Controller('users')
@UseInterceptors(ResponseInterceptor)
export class UsersController {
  @Get()
  findAll() {
    return [
      { id: 1, name: 'juan', lastname: 'perez' },
      { id: 2, name: 'jose', lastname: 'gonzalez' },
    ];
  }

  @Get(':id')
  findOne() {
    return { id: 1, name: 'juan', lastname: 'perez' };
  }
}
```

### Tipado de la respuesta

El tipo `ParsedResponse<T>` describe lo que devuelve el interceptor, útil para clientes o tests:

```typescript
import type { ParsedResponse } from '@tresdoce-nestjs-toolkit/response-parser';

type User = { id: number; name: string };

type UsersResponse = ParsedResponse<User[]>; // { data: User[] }
type UserResponse = ParsedResponse<User>; // User
```

### Contextos no HTTP

En contextos que no son HTTP (`rpc`, `ws`, `graphql`) no hay request de Express, así que la propagación de headers se omite. La transformación de arrays se sigue aplicando, por lo que **no se recomienda** registrar el interceptor de forma global en apps GraphQL (rompería los resolvers que devuelven listas).

<a name="response"></a>

## 🖥 Respuestas

### Lógica de transformación

| Valor retornado por el handler  | Body de la respuesta |
| ------------------------------- | -------------------- |
| Array (`[...]`)                 | `{ "data": [...] }`  |
| Objeto, primitivo, `null`, etc. | Sin cambios          |

### Colección (array): antes / después

Handler:

```typescript
@Get()
findAll() {
  return [
    { id: 1, name: 'juan', lastname: 'perez' },
    { id: 2, name: 'jose', lastname: 'gonzalez' },
  ];
}
```

❌ Sin interceptor:

```json
[
  { "id": 1, "name": "juan", "lastname": "perez" },
  { "id": 2, "name": "jose", "lastname": "gonzalez" }
]
```

✅ Con `ResponseInterceptor`:

```json
{
  "data": [
    { "id": 1, "name": "juan", "lastname": "perez" },
    { "id": 2, "name": "jose", "lastname": "gonzalez" }
  ]
}
```

Un array vacío también se envuelve: `[]` → `{ "data": [] }`.

### Entidad única: sin cambios

```json
{
  "id": 1,
  "name": "juan",
  "lastname": "perez"
}
```

> Si el handler ya devuelve `{ data: [...] }` (por ejemplo, con paginación), el objeto se respeta tal cual: no se vuelve a envolver.

### Headers propagados: antes / después

Con `PROPAGATE_HEADERS=x-request-id,x-correlation-id`:

```bash
curl -i http://localhost:8080/v1/users \
  -H 'X-Request-Id: abc-123' \
  -H 'X-Correlation-Id: corr-789' \
  -H 'X-Other: no-se-propaga'
```

❌ Sin interceptor:

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"juan","lastname":"perez"}]
```

✅ Con `ResponseInterceptor`:

```http
HTTP/1.1 200 OK
x-request-id: abc-123
x-correlation-id: corr-789
Content-Type: application/json; charset=utf-8

{"data":[{"id":1,"name":"juan","lastname":"perez"}]}
```

`X-Other` no aparece en la response porque no está en la lista. Los headers se setean antes de ejecutar el handler, así que también llegan al cliente cuando el handler lanza una excepción manejada por un filtro.

<a name="api-reference"></a>

## 📖 API Reference

### Exports

| Export                | Tipo    | Descripción                                                                    |
| --------------------- | ------- | ------------------------------------------------------------------------------ |
| `ResponseInterceptor` | `class` | Interceptor (`NestInterceptor`) que transforma la respuesta y propaga headers. |
| `ParsedResponse<T>`   | `type`  | `T extends readonly unknown[] ? { data: T } : T`.                              |

### `ResponseInterceptor<T = any>`

|                  |                                                              |
| ---------------- | ------------------------------------------------------------ |
| **Implementa**   | `NestInterceptor<T, ParsedResponse<T>>`                      |
| **Registro**     | `APP_INTERCEPTOR` en `AppModule`, o `@UseInterceptors(...)`. |
| **Dependencias** | `ConfigService` (requiere `ConfigModule` global).            |

#### Comportamiento

1. Si `context.getType() === 'http'`, lee `config.server.propagateHeaders` del `ConfigService` en cada request.
2. Por cada header de la lista (normalizado en minúsculas), si viene en la request con valor, lo setea en la response con `response.setHeader`.
3. Transforma el valor emitido por el handler: si es un array lo envuelve en `{ data: value }`; si no, lo devuelve sin cambios.

#### Configuración vía `ConfigService`

| Clave de configuración           | Tipo                   | Default | Descripción                                     |
| -------------------------------- | ---------------------- | ------- | ----------------------------------------------- |
| `config.server.propagateHeaders` | `string[]` \| `string` | `[]`    | Headers a propagar de la request a la response. |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
