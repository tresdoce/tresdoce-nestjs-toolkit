<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Archetype</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/archetype.svg">
    <br/>
</div>
<br/>

Módulo que expone un endpoint `/info` con información de la aplicación y sus dependencias. Está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter) o en cualquier proyecto que siga la misma arquitectura de configuración centralizada.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
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
npm install -S @tresdoce-nestjs-toolkit/archetype
```

```
yarn add @tresdoce-nestjs-toolkit/archetype
```

## 📦 Dependencias internas

Este paquete requiere los siguientes paquetes del toolkit:

| Paquete                                    | Razón                                                            |
| ------------------------------------------ | ---------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core) | Tipos `Typings.AppConfig`, decoradores base y utilidades comunes |

<a name="configurations"></a>

## ⚙️ Configuración

`ArchetypeModule` requiere que `ConfigModule` esté disponible globalmente en la aplicación (con `isGlobal: true`) y que la configuración centralizada esté registrada bajo la clave `config` (siguiendo el patrón del NestJS Starter).

El módulo usa internamente `ConfigService` para leer `config.project` y `config.server.appStage`, y lee el `package.json` del proyecto en tiempo de ejecución para construir la respuesta de `/info`.

<a name="use"></a>

## 👨‍💻 Uso

Importar `ArchetypeModule` en el módulo principal de la aplicación:

```typescript
// ./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArchetypeModule } from '@tresdoce-nestjs-toolkit/archetype';
import config from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    //...
    ArchetypeModule,
    //...
  ],
  //...
})
export class AppModule {}
```

> `ArchetypeModule` está decorado con `@Global()`, por lo que el `ArchetypeController` y el token `CONFIG_OPTIONS` quedan disponibles en toda la aplicación una vez importado.

### Endpoint `/info`

Una vez registrado el módulo, el endpoint está disponible en:

**Schema:** `<http|https>://<server_url><:port>/<app-context>/info`  
**Example:** `http://localhost:8080/v1/info`

> El endpoint está excluido de la documentación Swagger (`@ApiExcludeEndpoint()`).

#### Respuesta de ejemplo

```json
{
  "archetypeVersion": "1.2.0",
  "appStage": "dev",
  "apiPrefix": "MY-APP",
  "name": "my-nestjs-app",
  "version": "1.0.0",
  "description": "My NestJS Application",
  "author": {
    "name": "Maximiliano Delgado",
    "email": "mdelgado@tresdoce.com.ar",
    "url": "https://rudemex.github.io/"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/my-org/my-nestjs-app.git"
  },
  "homepage": "https://github.com/my-org/my-nestjs-app#readme",
  "dependencies": {
    "@tresdoce-nestjs-toolkit/archetype": "^1.2.0",
    "@tresdoce-nestjs-toolkit/health": "^1.2.0",
    "@tresdoce-nestjs-toolkit/http-client": "^1.2.0",
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^11.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^11.0.0",
    "@nestjs/testing": "^11.0.0"
  }
}
```

> Las secciones `dependencies` y `devDependencies` solo incluyen paquetes cuyo nombre comienza con `@tresdoce-nestjs-toolkit/` o `@nestjs/`. El resto de dependencias es filtrado intencionalmente.

### Exclusión del prefix global

El endpoint `/info` ya está incluido en `corePathsExcludes()` del paquete `@tresdoce-nestjs-toolkit/core`. Si usas ese helper en `main.ts`, el endpoint queda automáticamente excluido del prefix global:

```typescript
// ./src/main.ts
import { corePathsExcludes } from '@tresdoce-nestjs-toolkit/core';

app.setGlobalPrefix(`${server.context}`, {
  exclude: [...corePathsExcludes()],
});
```

Si necesitas excluir el endpoint del prefix global de forma manual, puedes usar la constante `manifestControllerExcludes`:

```typescript
import { manifestControllerExcludes } from '@tresdoce-nestjs-toolkit/archetype';

app.setGlobalPrefix(`${server.context}`, {
  exclude: [...manifestControllerExcludes],
});
```

<a name="api-reference"></a>

## 📖 API Reference

### `ArchetypeModule`

Módulo global (`@Global()`) que registra el controller y el service de archetype. Importa `ConfigModule` internamente. Solo necesita ser importado una vez en `AppModule`.

### `ArchetypeController`

| Método | Path    | Descripción                                                         |
| ------ | ------- | ------------------------------------------------------------------- |
| `GET`  | `/info` | Retorna el manifest completo de la aplicación. Excluido de Swagger. |

### `ArchetypeService`

| Método                            | Descripción                                                                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `generateManifest()`              | Combina `getArchetypeVersion()` y `getApplicationInfo()` en un único objeto.                                                                 |
| `getArchetypeVersion()`           | Lee la versión del paquete `@tresdoce-nestjs-toolkit/archetype` instalado.                                                                   |
| `getApplicationInfo()`            | Lee `config.project` y `config.server.appStage` de la configuración centralizada, y filtra las dependencias del `package.json` del proyecto. |
| `readFile(pathSegment, filename)` | Utilidad interna para leer y parsear archivos JSON.                                                                                          |

### Constants

| Export                       | Tipo                                             | Descripción                                                                                    |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `CONFIG_OPTIONS`             | `Symbol`                                         | Token de inyección para la configuración (`Typings.AppConfig`).                                |
| `manifestControllerExcludes` | `{ path: '/info'; method: RequestMethod.GET }[]` | Array con la ruta del endpoint `/info`, para ser usado en `setGlobalPrefix({ exclude: ... })`. |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
