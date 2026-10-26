<div align="center">
  <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
  <h1>Tresdoce NestJS Toolkit<br/>Rate-Limit</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
  <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
  <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/rate-limit.svg">
  <br/>
</div>
<br/>

> ⚠️ `@tresdoce-nestjs-toolkit/paas` depende de este paquete pero **no lo re-exporta**: para usar `RateLimitModule`, `ThrottlerGuard` o los decoradores hay que importarlos desde `@tresdoce-nestjs-toolkit/rate-limit`.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

`RateLimitModule` envuelve [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting): registra `ThrottlerModule` de forma asíncrona leyendo las opciones desde `config.server.rateLimits` y re-exporta toda la API pública de `@nestjs/throttler` (`ThrottlerGuard`, `@Throttle()`, `@SkipThrottle()`, `ThrottlerException`, `ThrottlerStorage`, etc.), así que no hace falta instalar `@nestjs/throttler` por separado.

Usalo cuando necesites limitar la cantidad de requests que un cliente (por defecto identificado por IP) puede hacer contra tus controllers en una ventana de tiempo, para proteger la API de abusos, scraping o fuerza bruta.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📨 Respuestas y headers](#responses)
- [🗄️ Storage en Redis (opcional)](#redis-storage)
- [📋 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.12 o superior ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 ([Documentación](https://nestjs.com/))
- `@nestjs/config` con `ConfigModule` registrado como global (`isGlobal: true`)
- Paquete ESM-only: el proyecto consumidor tiene que ser ESM (`"type": "module"`) o usar `module: nodenext`.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/rate-limit
```

```
yarn add @tresdoce-nestjs-toolkit/rate-limit
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

El módulo lee la key `server.rateLimits` de `Typings.AppConfig` (tipada como `ThrottlerModuleOptions`) desde el `ConfigService` registrado bajo `'config'`.

> ⚠️ En `@nestjs/throttler` v6 **`ttl` y `blockDuration` se expresan en milisegundos**. Podés usar los helpers `seconds()`, `minutes()`, `hours()`, `days()` y `weeks()` re-exportados por este paquete.

```typescript
//./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { minutes, seconds } from '@tresdoce-nestjs-toolkit/rate-limit';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      rateLimits: {
        throttlers: [
          {
            name: 'short',
            ttl: seconds(1), // 1000 ms
            limit: parseInt(process.env.RATE_LIMIT_SHORT ?? '3', 10),
          },
          {
            name: 'long',
            ttl: minutes(1), // 60000 ms
            limit: parseInt(process.env.RATE_LIMIT_LONG ?? '100', 10),
            blockDuration: minutes(5), // bloquea 5 minutos al superar el límite
          },
        ],
        ignoreUserAgents: [/googlebot/i, /bingbot/i],
        errorMessage: 'Too many requests. Please try again later.',
      },
    },
    //...
  };
});
```

Las variables de entorno (`RATE_LIMIT_SHORT`, `RATE_LIMIT_LONG` en el ejemplo) son a elección del proyecto: el módulo no lee ninguna variable de entorno por sí mismo.

> Si `server.rateLimits` no está definido, el módulo usa `{ throttlers: [] }`: la app inicia igual, `ThrottlerGuard` loguea un warning (`No throttlers are configured...`) y **no limita ningún request**.

`rateLimits` acepta un objeto `ThrottlerModuleOptions` con las siguientes propiedades:

| Property           | Type                                            | Description                                                                                                 |
| ------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `throttlers`       | `Array<ThrottlerOptions>`                       | **Requerido.** Lista de limitadores, cada uno con su propia ventana y límite.                               |
| `skipIf`           | `(context: ExecutionContext) => boolean`        | Omite la limitación si retorna `true`.                                                                      |
| `ignoreUserAgents` | `RegExp[]`                                      | Expresiones regulares de `User-Agent` a omitir (por ejemplo, bots de buscadores).                           |
| `getTracker`       | `ThrottlerGetTrackerFunction`                   | Obtiene el identificador del cliente. Por defecto `req.ip` (IPv6 normalizado a la subred `/64`).            |
| `generateKey`      | `ThrottlerGenerateKeyFunction`                  | Personaliza la clave de almacenamiento. Por defecto `sha256(<Controller>-<handler>-<throttler>-<tracker>)`. |
| `errorMessage`     | `string` o `((context, limitDetail) => string)` | Mensaje de la respuesta 429. Por defecto `ThrottlerException: Too Many Requests`.                           |
| `storage`          | `ThrottlerStorage`                              | Storage donde se cuentan los hits. Por defecto en memoria (`ThrottlerStorageService`).                      |
| `setHeaders`       | `boolean`                                       | Si es `false` no se envían los headers `X-RateLimit-*` ni `Retry-After`. Por defecto `true`.                |
| `ipv6SubnetPrefix` | `number`                                        | Prefijo de subred usado para agrupar direcciones IPv6 en el tracker por defecto. Por defecto `64`.          |

Cada item de `throttlers` (`ThrottlerOptions`):

| Property           | Type                                     | Description                                                                            |
| ------------------ | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `name`             | `string`                                 | Nombre del limitador. Si se omite es `default`. Se usa como sufijo de los headers.     |
| `limit`            | `Resolvable<number>`                     | Cantidad máxima de requests permitidas en la ventana `ttl`.                            |
| `ttl`              | `Resolvable<number>`                     | Ventana de tiempo **en milisegundos**.                                                 |
| `blockDuration`    | `Resolvable<number>`                     | Tiempo de bloqueo **en milisegundos** al superar el límite. Por defecto igual a `ttl`. |
| `ignoreUserAgents` | `RegExp[]`                               | `User-Agents` ignorados para este limitador.                                           |
| `skipIf`           | `(context: ExecutionContext) => boolean` | Omite este limitador si retorna `true`.                                                |
| `getTracker`       | `ThrottlerGetTrackerFunction`            | Tracker específico para este limitador.                                                |
| `generateKey`      | `ThrottlerGenerateKeyFunction`           | Generador de clave específico para este limitador.                                     |
| `setHeaders`       | `boolean`                                | Habilita/deshabilita los headers para este limitador.                                  |

`Resolvable<number>` puede ser un número o una función `(context: ExecutionContext) => number | Promise<number>`.

### Configuración avanzada

- `generateKey` rastrea las solicitudes por IP + ruta, en lugar de por controller + handler.
- `blockDuration` bloquea al cliente 5 minutos si supera 10 requests en 1 minuto.
- `skipIf` omite la limitación para usuarios administradores autenticados.
- `getTracker` usa el header `x-forwarded-for` cuando la app corre detrás de un proxy (alternativa: `app.set('trust proxy', 1)` en Express).

```typescript
//./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { minutes } from '@tresdoce-nestjs-toolkit/rate-limit';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      rateLimits: {
        throttlers: [
          {
            limit: 10,
            ttl: minutes(1),
            blockDuration: minutes(5),
          },
        ],
        skipIf: (context) => {
          const request = context.switchToHttp().getRequest();
          return request.user?.isAdmin === true;
        },
        getTracker: (req) =>
          (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ?? req.ip,
        generateKey: (context, tracker, throttlerName) => {
          const request = context.switchToHttp().getRequest();
          return `${throttlerName}-${tracker}-${request.route.path}`;
        },
      },
    },
    //...
  };
});
```

<a name="use"></a>

## 👨‍💻 Uso

### 1. Importar RateLimitModule

Importar `RateLimitModule` en el módulo principal de la aplicación. Es `@Global()`, por lo que alcanza con importarlo una sola vez en `AppModule`.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RateLimitModule } from '@tresdoce-nestjs-toolkit/rate-limit';

import configuration from './config/configuration.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    RateLimitModule,
    //...
  ],
})
export class AppModule {}
```

### 2. Aplicar ThrottlerGuard

Importar el módulo **no** limita nada por sí solo: hay que aplicar `ThrottlerGuard`, de forma global, por controlador o por ruta.

#### Global (recomendado, como provider `APP_GUARD`)

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RateLimitModule, ThrottlerGuard } from '@tresdoce-nestjs-toolkit/rate-limit';

@Module({
  imports: [
    //...
    RateLimitModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

> `ThrottlerGuard` necesita inyección de dependencias (opciones, storage y `Reflector`), por eso no se puede usar `app.useGlobalGuards(new ThrottlerGuard())`. Si querés registrarlo desde `main.ts`, obtené la instancia del contenedor: `app.useGlobalGuards(app.get(ThrottlerGuard))` (requiere declarar `ThrottlerGuard` como provider en algún módulo).

#### A nivel de controlador o ruta

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@tresdoce-nestjs-toolkit/rate-limit';

@Controller('test')
@UseGuards(ThrottlerGuard)
export class TestController {
  @Get()
  getTest() {
    return 'Esta es una ruta protegida por el rate limit';
  }
}
```

### 3. Omitir el rate limit con @SkipThrottle()

`@SkipThrottle()` omite la limitación en un controlador o método. Recibe un objeto `{ [nombreDelThrottler]: boolean }`.

> ⚠️ `@SkipThrottle()` sin argumentos equivale a `@SkipThrottle({ default: true })`: **solo omite el throttler `default`** (el que no tiene `name`). Si tus throttlers tienen nombre (`short`, `long`...), tenés que indicarlos explícitamente.

```typescript
import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@tresdoce-nestjs-toolkit/rate-limit';

@SkipThrottle({ short: true, long: true })
@Controller('users')
export class UsersController {
  // Se omite el rate limit (heredado del controller).
  @Get()
  findAll() {
    return 'List users work without rate limiting.';
  }

  // Vuelve a aplicar el throttler "short" en esta ruta.
  @SkipThrottle({ short: false })
  @Get('search')
  search() {
    return 'Search users works with the "short" rate limit.';
  }
}
```

### 4. Sobreescribir límites con @Throttle()

`@Throttle()` sobreescribe `limit`, `ttl` y/o `blockDuration` de los throttlers configurados, por nombre, para un controlador o método.

```typescript
import { Controller, Post } from '@nestjs/common';
import { Throttle, minutes } from '@tresdoce-nestjs-toolkit/rate-limit';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ long: { limit: 5, ttl: minutes(1), blockDuration: minutes(15) } })
  login() {
    return 'Este endpoint permite máximo 5 intentos por minuto';
  }
}
```

### 5. Leer las opciones resueltas

El token `RATE_LIMIT_MODULE_OPTIONS` expone las opciones resueltas desde `config.server.rateLimits`.

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { RATE_LIMIT_MODULE_OPTIONS } from '@tresdoce-nestjs-toolkit/rate-limit';
import type { ThrottlerModuleOptions } from '@tresdoce-nestjs-toolkit/rate-limit';

@Injectable()
export class MyService {
  constructor(
    @Inject(RATE_LIMIT_MODULE_OPTIONS)
    private readonly rateLimitOptions: ThrottlerModuleOptions,
  ) {}
}
```

<a name="responses"></a>

## 📨 Respuestas y headers

Con la configuración de ejemplo (`short`: 3 req/s, `long`: 100 req/min), cada respuesta exitosa incluye los headers de rate limit, uno por throttler. El sufijo es `-<name>`; el throttler `default` no lleva sufijo (`X-RateLimit-Limit`).

```http
HTTP/1.1 200 OK
X-RateLimit-Limit-short: 3
X-RateLimit-Remaining-short: 2
X-RateLimit-Reset-short: 1
X-RateLimit-Limit-long: 100
X-RateLimit-Remaining-long: 99
X-RateLimit-Reset-long: 60
Content-Type: application/json; charset=utf-8
```

| Header                           | Descripción                                                               |
| -------------------------------- | ------------------------------------------------------------------------- |
| `X-RateLimit-Limit[-<name>]`     | Límite de requests de la ventana.                                         |
| `X-RateLimit-Remaining[-<name>]` | Requests restantes en la ventana actual.                                  |
| `X-RateLimit-Reset[-<name>]`     | Segundos hasta que se reinicia la ventana.                                |
| `Retry-After[-<name>]`           | Solo en la respuesta 429: segundos que faltan para que expire el bloqueo. |

Al superar el límite, `ThrottlerGuard` lanza `ThrottlerException` (`HttpException` con status `429`). Con el exception filter por defecto de Nest la respuesta es:

```http
HTTP/1.1 429 Too Many Requests
Retry-After-short: 30
Content-Type: application/json; charset=utf-8
```

```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later."
}
```

Si no se configura `errorMessage`, el mensaje es `"ThrottlerException: Too Many Requests"`. Si la app usa el `ExceptionsFilter` de `@tresdoce-nestjs-toolkit/filters`, el body sigue el formato de error de ese filtro, con el mismo status `429`.

<a name="redis-storage"></a>

## 🗄️ Storage en Redis (opcional)

El storage por defecto es en memoria: los contadores no se comparten entre réplicas y se pierden al reiniciar. Si la app corre con varias instancias, usá un storage compartido implementando la interfaz `ThrottlerStorage` y pasándolo en `rateLimits.storage`.

Una opción es [`@nest-lab/throttler-storage-redis`](https://www.npmjs.com/package/@nest-lab/throttler-storage-redis) (usa `ioredis`). **No es dependencia de este paquete**: hay que instalarla en el proyecto (`yarn add @nest-lab/throttler-storage-redis ioredis`). Tené en cuenta que su última versión (1.2.0) declara peers `@nestjs/common`/`@nestjs/core` hasta `^11`, por lo que con Nest 12 vas a ver un warning de peer dependencies.

```typescript
//./src/config/configuration.ts
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { minutes } from '@tresdoce-nestjs-toolkit/rate-limit';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Redis } from 'ioredis';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      rateLimits: {
        throttlers: [{ ttl: minutes(1), limit: 100 }],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: process.env.REDIS_HOST ?? 'localhost',
            port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
            password: process.env.REDIS_PASSWORD,
          }),
        ),
      },
    },
    //...
  };
});
```

`docker-compose.yml` mínimo para levantar Redis localmente:

```yaml
services:
  redis:
    image: redis:7.4.2-alpine
    container_name: redis
    restart: always
    ports:
      - '6379:6379'
    command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456']
```

```
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=123456
```

<a name="api-reference"></a>

## 📋 API Reference

### Exports propios

| Export                      | Tipo                                                       | Descripción                                                                                                                                        |
| --------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RateLimitModule`           | Módulo `@Global()`                                         | Registra `ThrottlerModule.forRootAsync()` con las opciones de `config.server.rateLimits`. Exporta `ThrottlerModule` y `RATE_LIMIT_MODULE_OPTIONS`. |
| `RATE_LIMIT_MODULE_OPTIONS` | `Symbol.for('RATE_LIMIT_MODULE_OPTIONS')`                  | Token para inyectar las `ThrottlerModuleOptions` resueltas.                                                                                        |
| `rateLimitOptionsFactory`   | `(configService: ConfigService) => ThrottlerModuleOptions` | Factory usada por el módulo: devuelve `config.server.rateLimits` o `{ throttlers: [] }` si no está definido.                                       |

### Re-exports de @nestjs/throttler

Este paquete re-exporta toda la API pública de `@nestjs/throttler` (v6). Los elementos más usados:

| Export                                                   | Tipo             | Descripción                                                                                    |
| -------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------- |
| `ThrottlerGuard`                                         | Guard            | Aplica el rate limiting. Se puede extender para sobreescribir `getTracker`, `shouldSkip`, etc. |
| `Throttle(options)`                                      | Decorador        | Sobreescribe `limit`/`ttl`/`blockDuration` por throttler para un controlador o método.         |
| `SkipThrottle(skip?)`                                    | Decorador        | Omite throttlers por nombre (por defecto `{ default: true }`).                                 |
| `ThrottlerException`                                     | Excepción        | `HttpException` 429 lanzada al superar el límite.                                              |
| `ThrottlerModule`                                        | Módulo           | Módulo base (ya configurado internamente por `RateLimitModule`).                               |
| `ThrottlerStorage` / `ThrottlerStorageService`           | Interfaz / Clase | Contrato del storage y su implementación en memoria.                                           |
| `ThrottlerModuleOptions`, `ThrottlerOptions`             | Tipos            | Opciones del módulo y de cada throttler.                                                       |
| `seconds()`, `minutes()`, `hours()`, `days()`, `weeks()` | Helpers          | Convierten la unidad a milisegundos.                                                           |
| `InjectThrottlerOptions()`, `InjectThrottlerStorage()`   | Decoradores      | Inyectan las opciones y el storage de `ThrottlerModule`.                                       |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
  <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
    <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
  </a><br/>
  <p>Made with ❤</p>
</div>
