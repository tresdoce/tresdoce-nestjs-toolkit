<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Archetype</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/archetype.svg">
    <br/>
</div>
<br/>

Módulo que expone un endpoint `GET /info` con el manifest de la aplicación: datos del proyecto, stage, versiones de las dependencias `@nestjs/*` y `@tresdoce-nestjs-toolkit/*`, commit desplegado y semilla de origen. Usalo para saber rápidamente qué versión de la app y del toolkit está corriendo en cada ambiente. Está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter) o en cualquier proyecto que siga la misma arquitectura de configuración centralizada.

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
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/archetype
```

```
yarn add @tresdoce-nestjs-toolkit/archetype
```

## 📦 Dependencias internas

| Paquete                                    | Razón                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| [`@tresdoce-nestjs-toolkit/core`](../core) | Tipo `Typings.AppConfig` de la configuración centralizada (solo tipos) |

> El paquete no necesita ningún servicio externo (base de datos, broker, etc.): solo lee la configuración y archivos `package.json` del disco.

<a name="configurations"></a>

## ⚙️ Configuración

`ArchetypeModule` no tiene `register()`/`registerAsync()`: lee **toda** la configuración centralizada (`Typings.AppConfig`) desde la key `config` del `ConfigService`, así que `ConfigModule` tiene que estar registrado con `isGlobal: true` y con un `registerAs('config', ...)`.

De esa configuración usa únicamente:

| Key                      | Uso en `/info`                                                                    |
| ------------------------ | --------------------------------------------------------------------------------- |
| `config.project.*`       | `apiPrefix`, `name`, `version`, `description`, `author`, `repository`, `homepage` |
| `config.server.appStage` | `appStage`                                                                        |

```typescript
// ./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import PACKAGE_JSON from '../../package.json' with { type: 'json' };

export default registerAs('config', (): Typings.AppConfig => ({
  project: {
    apiPrefix: process.env.API_PREFIX || 'API-PREFIX',
    name: PACKAGE_JSON.name,
    version: PACKAGE_JSON.version,
    description: PACKAGE_JSON.description,
    author: PACKAGE_JSON.author,
    repository: PACKAGE_JSON.repository,
    bugs: PACKAGE_JSON.bugs,
    homepage: PACKAGE_JSON.homepage,
  },
  server: {
    isProd: process.env.NODE_ENV === 'production',
    appStage: (process.env.APP_STAGE || 'local') as Typings.TAppStage,
    port: parseInt(process.env.PORT, 10) || 8080,
    context: process.env.CONTEXT || 'v1',
    origins: process.env.ORIGINS ? process.env.ORIGINS.split(',') : '*',
    allowedHeaders: process.env.ALLOWED_HEADERS,
    allowedMethods: process.env.ALLOWED_METHODS,
    corsEnabled: process.env.CORS_ENABLED === 'true',
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
  },
  swagger: {
    path: process.env.SWAGGER_PATH || 'docs',
    enabled: process.env.SWAGGER_ENABLED === 'true',
  },
}));
```

Además, en cada request a `/info` el módulo lee en tiempo de ejecución:

- El `package.json` de la aplicación, resuelto desde `process.cwd()` (la app tiene que arrancar desde su raíz). De ahí toma `dependencies`, `devDependencies` y el campo opcional `seed`.
- Su propio `package.json`, buscándolo hacia arriba desde `import.meta.dirname`, para informar `archetypeVersion`.

### Variables de entorno

| Variable         | Requerida | Descripción                                                                                                                                                            |
| ---------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CURRENT_COMMIT` | No        | Hash del commit desplegado. Se devuelve en `currentCommit` (`''` si no está definida). Ideal para setearla en el pipeline de CI/CD o en el `Dockerfile` (`ARG`/`ENV`). |

### Campo `seed` (opcional)

Si el `package.json` de la aplicación tiene un campo `seed`, se devuelve tal cual en `/info`. Sirve para indicar desde qué starter/semilla se generó el proyecto:

```json
{
  "name": "my-nestjs-app",
  "version": "1.0.0",
  "seed": {
    "name": "nestjs-starter",
    "version": "5.0.0"
  }
}
```

<a name="use"></a>

## 👨‍💻 Uso

Importar `ArchetypeModule` una sola vez en el módulo principal de la aplicación:

```typescript
// ./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArchetypeModule } from '@tresdoce-nestjs-toolkit/archetype';
import config from './config/configuration.js';

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

> `ArchetypeModule` está decorado con `@Global()` y exporta `CONFIG_OPTIONS` (el `Typings.AppConfig` completo) y `ArchetypeController`.

### Endpoint `/info`

**Schema:** `<http|https>://<server_url><:port>/<app-context>/info`  
**Example:** `http://localhost:8080/v1/info`

> El endpoint está excluido de la documentación Swagger (`@ApiExcludeEndpoint()`).

#### Respuesta de ejemplo

```json
{
  "archetypeVersion": "2.0.13",
  "appStage": "local",
  "apiPrefix": "API-PREFIX",
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
    "@nestjs/common": "^12.2.0",
    "@nestjs/config": "^12.0.1",
    "@nestjs/core": "^12.2.0",
    "@nestjs/platform-express": "^12.2.0",
    "@nestjs/swagger": "^12.0.4",
    "@tresdoce-nestjs-toolkit/archetype": "^2.0.13",
    "@tresdoce-nestjs-toolkit/paas": "^2.0.12"
  },
  "devDependencies": {
    "@nestjs/cli": "^12.0.0",
    "@nestjs/testing": "^12.2.0",
    "@tresdoce-nestjs-toolkit/commons": "^2.0.0"
  },
  "currentCommit": "ea0d2c3",
  "seed": {
    "name": "nestjs-starter",
    "version": "5.0.0"
  }
}
```

> `dependencies` y `devDependencies` solo incluyen paquetes cuyo nombre empieza con `@tresdoce-nestjs-toolkit` o `@nestjs`; el resto se filtra intencionalmente. Si el `package.json` no tiene alguna de esas secciones, se devuelve `{}`.

#### Respuesta de error

Si no se puede leer alguno de los `package.json` (por ejemplo, la app no arrancó desde su raíz) o su contenido no es JSON válido, el endpoint responde `500`:

```json
{
  "statusCode": 500,
  "message": "ArchetypeService: unable to read file \"/app/package.json\"",
  "error": "Internal Server Error"
}
```

> El formato final depende del filtro de excepciones de la app (por ejemplo `@tresdoce-nestjs-toolkit/filters`). El error original queda en la propiedad `cause` de la excepción.

### Usar el service directamente

`ArchetypeService` se puede inyectar (por ejemplo, para loguear la versión al iniciar o exponer el manifest en otro endpoint):

```typescript
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ArchetypeService } from '@tresdoce-nestjs-toolkit/archetype';
import type { IArchetypeManifest } from '@tresdoce-nestjs-toolkit/archetype';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(StartupService.name);

  constructor(private readonly archetypeService: ArchetypeService) {}

  async onApplicationBootstrap(): Promise<void> {
    const manifest: IArchetypeManifest = await this.archetypeService.generateManifest();
    this.logger.log(
      `${manifest.name}@${manifest.version} (${manifest.currentCommit || 'no commit'})`,
    );
  }
}
```

### Exclusión del prefix global

Por defecto `/info` queda bajo el prefix global (`/v1/info`). Si querés exponerlo en la raíz (`/info`), excluilo en `setGlobalPrefix` con la constante `manifestControllerExcludes`:

```typescript
// ./src/main.ts
import { manifestControllerExcludes } from '@tresdoce-nestjs-toolkit/archetype';

app.setGlobalPrefix(`${server.context}`, {
  exclude: [...manifestControllerExcludes],
});
```

> `corePathsExcludes()` de `@tresdoce-nestjs-toolkit/core` también incluye `/<CONTEXT>/info` (junto con health y metrics); se usa para excluir estas rutas de logs/tracing.

<a name="api-reference"></a>

## 📖 API Reference

### Exports

| Export                       | Tipo          | Descripción                                                                            |
| ---------------------------- | ------------- | -------------------------------------------------------------------------------------- |
| `ArchetypeModule`            | Módulo        | Módulo global que registra el controller, el service y `CONFIG_OPTIONS`.               |
| `ArchetypeController`        | Controller    | Expone `GET /info`.                                                                    |
| `ArchetypeService`           | Service       | Arma el manifest de la aplicación.                                                     |
| `CONFIG_OPTIONS`             | `Symbol`      | Token de inyección del `Typings.AppConfig` completo.                                   |
| `manifestControllerExcludes` | `RouteInfo[]` | `[{ path: '/info', method: RequestMethod.GET }]`, para `setGlobalPrefix({ exclude })`. |
| `IArchetypeManifest`         | type          | Respuesta de `/info` (`IArchetypeVersion & IApplicationInfo`).                         |
| `IArchetypeVersion`          | interface     | `{ archetypeVersion: string }`.                                                        |
| `IApplicationInfo`           | interface     | Datos de la app (ver tabla abajo).                                                     |
| `IArchetypeAuthor`           | interface     | `{ name: string; email: string; url: string }`.                                        |
| `IArchetypeRepository`       | interface     | `{ type: string; url: string }`.                                                       |

### `ArchetypeController`

| Método | Path    | Respuesta            | Descripción                                              |
| ------ | ------- | -------------------- | -------------------------------------------------------- |
| `GET`  | `/info` | `IArchetypeManifest` | Manifest completo de la aplicación. Excluido de Swagger. |

### `ArchetypeService`

| Método                            | Retorna                       | Descripción                                                                                                                           |
| --------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `generateManifest()`              | `Promise<IArchetypeManifest>` | Combina `getArchetypeVersion()` y `getApplicationInfo()` (en paralelo) en un único objeto.                                            |
| `getArchetypeVersion()`           | `Promise<IArchetypeVersion>`  | Versión del paquete `@tresdoce-nestjs-toolkit/archetype` instalado.                                                                   |
| `getApplicationInfo()`            | `Promise<IApplicationInfo>`   | `config.project` + `config.server.appStage`, dependencias filtradas y `seed` del `package.json` de la app, y `CURRENT_COMMIT`.        |
| `readFile(pathSegment, filename)` | `Promise<any>`                | Lee y parsea un JSON. Lanza `InternalServerErrorException` (con `cause`) si el archivo no existe o si su contenido no es JSON válido. |

### `IApplicationInfo`

| Propiedad         | Tipo                     | Origen                                                                       |
| ----------------- | ------------------------ | ---------------------------------------------------------------------------- |
| `appStage`        | `string`                 | `config.server.appStage`                                                     |
| `apiPrefix`       | `string`                 | `config.project.apiPrefix`                                                   |
| `name`            | `string`                 | `config.project.name`                                                        |
| `version`         | `string`                 | `config.project.version`                                                     |
| `description`     | `string`                 | `config.project.description`                                                 |
| `author`          | `IArchetypeAuthor`       | `config.project.author`                                                      |
| `repository`      | `IArchetypeRepository`   | `config.project.repository`                                                  |
| `homepage`        | `string`                 | `config.project.homepage`                                                    |
| `dependencies`    | `Record<string, string>` | `package.json` de la app, filtrado (`@tresdoce-nestjs-toolkit*`, `@nestjs*`) |
| `devDependencies` | `Record<string, string>` | `package.json` de la app, filtrado (`@tresdoce-nestjs-toolkit*`, `@nestjs*`) |
| `currentCommit`   | `string`                 | `process.env.CURRENT_COMMIT` o `''`                                          |
| `seed`            | `Record<string, any>`    | Campo `seed` del `package.json` de la app o `{}`                             |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
