<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Filters</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v18.20.4&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v10.8.2&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.3.10&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/filters.svg">
    <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este filtro se encuentra implementado en el
> package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

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
- Node.js v18.20.4 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v10.8.2 or higher
- NestJS v10.3.10 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/filters
```

```
yarn add @tresdoce-nestjs-toolkit/filters
```

<a name="configurations"></a>

## ⚙️ Configuración

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

<a name="use"></a>

## 👨‍💻 Uso

Para conocer sobre todas las excepciones disponibles, ingresa a la documentación
de [NestJS - Exception Filters](https://docs.nestjs.com/exception-filters#built-in-http-exceptions)

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

### Example response

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

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
