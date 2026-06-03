<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Filters</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/filters.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este filtro se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

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
npm install -S @tresdoce-nestjs-toolkit/filters
```

```
yarn add @tresdoce-nestjs-toolkit/filters
```

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                    | Razón                                                            |
| ------------------------------------------ | ---------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core) | Tipos `Typings.AppConfig`, decoradores base y utilidades comunes |

<a name="configurations"></a>

## ⚙️ Configuración

Registrar `ExceptionsFilter` como filtro global en `main.ts`, pasándole la configuración centralizada de la aplicación.

```typescript
//./src/main.ts
import { ConfigService } from '@nestjs/config';
import { ExceptionsFilter } from '@tresdoce-nestjs-toolkit/filters';

//...

async function bootstrap() {
  //...
  const appConfig = app.get<ConfigService>(ConfigService)['internalConfig']['config'];
  app.useGlobalFilters(new ExceptionsFilter(appConfig));
  //...
}
```

El filtro lee `appConfig.project.apiPrefix` para construir el código de error (`<API-PREFIX>-<HTTP_STATUS>`). Si la configuración no está disponible, usa el valor de fallback `'API-PREFIX'`.

<a name="use"></a>

## 👨‍💻 Uso

Para conocer sobre todas las excepciones disponibles, ingresa a la documentación
de [NestJS - Exception Filters](https://docs.nestjs.com/exception-filters#built-in-http-exceptions).

El filtro captura **cualquier excepción** (tanto `HttpException` como errores genéricos) y responde con un payload normalizado, usando el Content-Type `application/problem+json` (RFC 7807).

### HttpException

```typescript
try {
  //...
} catch (error) {
  throw new HttpException(error.message, error.response.status);
}
```

```typescript
try {
  //...
} catch (error) {
  throw new HttpException(
    {
      message: error.message,
    },
    error.response.status,
  );
}
```

### Custom message HttpException

```typescript
try {
  //...
} catch (error) {
  throw new HttpException('This is a message', error.response.status);
}
```

```typescript
try {
  //...
} catch (error) {
  throw new HttpException(
    {
      message: 'This is a message',
    },
    error.response.status,
  );
}
```

### Simple exception

```typescript
try {
  //...
} catch {
  throw new Error('this is an error');
}
```

### Respuestas de ejemplo

#### Error simple (con fallback de prefijo)

```json
{
  "error": {
    "status": 404,
    "instance": "GET /api/characters",
    "code": "API-PREFIX-NOT_FOUND",
    "message": "Request failed with status code 404"
  }
}
```

#### Error con prefijo de proyecto configurado

```json
{
  "error": {
    "status": 404,
    "instance": "GET /api/users/123456",
    "code": "MY-API-NOT_FOUND",
    "message": "User #123456 not found"
  }
}
```

#### Error de validación con detalle

Cuando la excepción contiene un array de mensajes (por ejemplo, errores de validación de `class-validator`), el campo `message` contiene el nombre del error HTTP y el campo `detail` contiene el listado de mensajes individuales.

```json
{
  "error": {
    "status": 400,
    "instance": "POST /api/users",
    "code": "MY-API-BAD_REQUEST",
    "message": "Bad Request",
    "detail": [
      {
        "message": "firstName must be a string"
      },
      {
        "message": "lastName must be a string"
      },
      {
        "message": "email must be an email"
      },
      {
        "message": "email must be a string"
      }
    ]
  }
}
```

#### Error genérico (no HttpException)

Para errores que no son instancias de `HttpException`, el filtro responde con `500 Internal Server Error` y usa el mensaje del error como `message`.

```json
{
  "error": {
    "status": 500,
    "instance": "GET /api/users",
    "code": "MY-API-INTERNAL_SERVER_ERROR",
    "message": "this is an error"
  }
}
```

<a name="api-reference"></a>

## 📋 API Reference

### ExceptionsFilter

Filtro global que captura todas las excepciones y las normaliza en un payload RFC 7807.

```typescript
new ExceptionsFilter(appConfig: Typings.AppConfig)
```

- Responde con `Content-Type: application/problem+json`.
- Usa `appConfig.project.apiPrefix` para construir el código de error. Si no está configurado, usa `'API-PREFIX'` como fallback.
- Las rutas excluidas (definidas por `excludePaths()` de `@tresdoce-nestjs-toolkit/core`) reciben respuestas sin formateo especial.

### buildErrorPayload()

Construye el payload de error normalizado a partir de los parámetros de la excepción. Útil para reutilizar la lógica de construcción de errores fuera del filtro (por ejemplo, en servicios de logging).

```typescript
buildErrorPayload(
  apiPrefix: string,
  method: string,
  url: string,
  exception: any,
): { error: { status: number; instance: string; code: string; message: any; detail: any } }
```

| Parámetro   | Type     | Description                                                 |
| ----------- | -------- | ----------------------------------------------------------- |
| `apiPrefix` | `string` | Prefijo de la API, usado para construir el código de error. |
| `method`    | `string` | Método HTTP de la request (ej: `'GET'`, `'POST'`).          |
| `url`       | `string` | URL de la request (ej: `'/api/users/123'`).                 |
| `exception` | `any`    | Excepción capturada (puede ser `HttpException` o `Error`).  |

### getErrorMessage()

Extrae y normaliza el mensaje de error a partir del response de una excepción.

```typescript
getErrorMessage(
  exceptionResponse: ExceptionResponse | string,
  httpStatus: string,
): ExceptionResponse
```

Cuando `exceptionResponse.message` es un array (validaciones), retorna el nombre del error en `message` y el array mapeado como `{ message }` en `detail`.

### getCode()

Extrae y formatea el código de error en `UPPER_SNAKE_CASE` a partir del response de la excepción.

```typescript
getCode(exResponse: ExceptionResponse | string): string
```

### Constantes

| Constante              | Valor                        | Descripción                                                     |
| ---------------------- | ---------------------------- | --------------------------------------------------------------- |
| `PROBLEM_CONTENT_TYPE` | `'application/problem+json'` | Content-Type usado en todas las respuestas de error (RFC 7807). |

### Tipos

#### ExceptionResponse

```typescript
interface ExceptionResponse {
  error?: string;
  detail?: string;
  message?: string | string[] | ValidationError[];
}
```

#### IProblemDetail

Estructura del payload de error retornado en las respuestas.

```typescript
interface IProblemDetail {
  status: number;
  instance?: string;
  code?: string;
  message: string;
  detail?: string | object | ValidationError[] | Array<string | object>;
  [key: string]: unknown;
}
```

#### IErrorDetail

```typescript
interface IErrorDetail {
  message: string;
  error?: {
    type?: string;
    instance?: string;
    detail?: string;
    code?: string;
  };
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
