<div align="center">
  <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
  <h1>Tresdoce NestJS Toolkit<br/>Rate-Limit</h1>
</div>

<div align="center">
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
  <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
  <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
  <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/rate-limit.svg">
  <br/>
</div>
<br/>

> ⚠️ Es importante tener en cuenta que este módulo se encuentra implementado en el package `@tresdoce-nestjs-toolkit/paas`, ya que es una funcionalidad core para el starter.

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

El módulo envuelve [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting) y re-exporta toda su API pública, por lo que no es necesario instalar `@nestjs/throttler` por separado.

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
npm install -S @tresdoce-nestjs-toolkit/rate-limit
```

```
yarn add @tresdoce-nestjs-toolkit/rate-limit
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos del rate limit en `configuration.ts` utilizando la key `rateLimits` dentro de `server`.
Puedes encontrar más información en la [documentación oficial de @nestjs/throttler](https://docs.nestjs.com/security/rate-limiting).

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      rateLimits: {
        throttlers: [
          {
            limit: 10,
            ttl: 60,
          },
        ],
      },
    },
    //...
  };
});
```

`RateLimitModule` utiliza las opciones de `ThrottlerModule` para configurar las restricciones.
Estas opciones se pueden pasar como un objeto `ThrottlerModuleOptions` que contiene:

| Property           | Type                                            | Description                                                                                          |
| ------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `throttlers`       | `Array<ThrottlerOptions>`                       | Lista de limitadores individuales con sus propias configuraciones de límite de tasa.                 |
| `skipIf`           | `(context: ExecutionContext) => boolean`        | Función que omite la limitación si retorna `true`.                                                   |
| `ignoreUserAgents` | `RegExp[]`                                      | Lista de expresiones regulares para omitir ciertos `User-Agents`, como bots de motores de búsqueda.  |
| `getTracker`       | `ThrottlerGetTrackerFunction`                   | Función para obtener el identificador único del cliente (por ejemplo, dirección IP o ID de usuario). |
| `generateKey`      | `ThrottlerGenerateKeyFunction`                  | Función para personalizar la clave de rastreo única para cada cliente.                               |
| `errorMessage`     | `string` o `((context, limitDetail) => string)` | Mensaje de error personalizado cuando se alcanza el límite de solicitudes.                           |
| `storage`          | `ThrottlerStorage`                              | Mecanismo de almacenamiento usado para rastrear las solicitudes, por defecto en memoria.             |

Cada item (`ThrottlerOptions`) permite configurar un limitador específico:

| Property           | Type                                     | Description                                                                               |
| ------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| `name`             | `string`                                 | Nombre opcional para identificar el limitador de tasa.                                    |
| `limit`            | `Resolvable<number>`                     | Número máximo de solicitudes permitidas en el intervalo `ttl`.                            |
| `ttl`              | `Resolvable<number>`                     | Intervalo de tiempo en segundos durante el cual se cuentan las solicitudes.               |
| `blockDuration`    | `Resolvable<number>`                     | Duración en segundos durante la cual se bloquea al cliente después de alcanzar el límite. |
| `ignoreUserAgents` | `RegExp[]`                               | Lista de `User-Agents` que serán ignorados para este limitador.                           |
| `skipIf`           | `(context: ExecutionContext) => boolean` | Función para omitir la limitación de tasa si retorna `true`.                              |
| `getTracker`       | `ThrottlerGetTrackerFunction`            | Función para rastrear el cliente específico.                                              |
| `generateKey`      | `ThrottlerGenerateKeyFunction`           | Personalización de la clave única que rastrea las solicitudes de cada cliente.            |

### Ejemplos de Configuración Avanzada

- La configuración con `generateKey` rastrea las solicitudes por combinación de IP y ruta, permitiendo límites de tasa específicos por ruta.
- El `blockDuration` bloquea al cliente durante 5 minutos si supera el límite de 10 solicitudes en 1 minuto.
- El `skipIf` omite la limitación de tasa para usuarios administradores autenticados.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    server: {
      //...
      rateLimits: {
        throttlers: [
          {
            limit: 10,
            ttl: 60,
            blockDuration: 300,
          },
        ],
        skipIf: (context) => {
          const request = context.switchToHttp().getRequest();
          return request.user?.isAdmin;
        },
        generateKey: (context, trackerString) => {
          const request = context.switchToHttp().getRequest();
          return `${trackerString}-${request.route.path}`;
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

Importar `RateLimitModule` en el módulo principal de la aplicación. Este paso es obligatorio para que la configuración de rate limiting quede activa.

```typescript
//./src/app.module.ts
import { RateLimitModule } from '@tresdoce-nestjs-toolkit/rate-limit';

@Module({
  imports: [
    //...
    RateLimitModule,
    //...
  ],
  //...
})
export class AppModule {}
```

### 2. Aplicar ThrottlerGuard

Para activar el rate limiting, es necesario aplicar el `ThrottlerGuard`. Puede hacerse de forma global, por controlador o por ruta.

#### Aplicación Global (main.ts)

```typescript
//./src/main.ts
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@tresdoce-nestjs-toolkit/rate-limit';

//...

async function bootstrap() {
  //...
  app.useGlobalGuards(new ThrottlerGuard());
  //...
}
```

#### Aplicación Global (como provider en app.module.ts)

```typescript
//./src/app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { RateLimitModule, ThrottlerGuard } from '@tresdoce-nestjs-toolkit/rate-limit';

@Module({
  imports: [
    //...
    RateLimitModule,
    //...
  ],
  providers: [
    //...
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    //...
  ],
  //...
})
export class AppModule {}
```

#### Aplicación a nivel de controlador

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

### 3. Saltear rate limit

El decorador `@SkipThrottle()` se usa para omitir el rate limit en métodos o controladores específicos que de otro modo estarían protegidos por el `ThrottlerGuard`.

```typescript
import { SkipThrottle } from '@tresdoce-nestjs-toolkit/rate-limit';

@SkipThrottle()
@Controller('users')
export class UsersController {
  // Rate limiting is applied to this route.
  @SkipThrottle({ default: false })
  dontSkip() {
    return 'List users work with Rate limiting.';
  }
  // This route will skip rate limiting.
  doSkip() {
    return 'List users work without Rate limiting.';
  }
}
```

### 4. Sobreescribir límites por ruta con @Throttle()

El decorador `@Throttle()` permite definir límites específicos para un controlador o método individual, sobreescribiendo los valores globales configurados en `rateLimits`.

```typescript
import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@tresdoce-nestjs-toolkit/rate-limit';

@Controller('upload')
export class UploadController {
  @Get()
  @Throttle({ default: { limit: 3, ttl: 60 } })
  uploadFile() {
    return 'Este endpoint permite máximo 3 requests por minuto';
  }
}
```

<a name="api-reference"></a>

## 📋 API Reference

### RateLimitModule

Módulo global que configura `ThrottlerModule` de forma asíncrona leyendo las opciones desde `config.server.rateLimits` de la configuración centralizada.

### Re-exports de @nestjs/throttler

Este módulo re-exporta toda la API pública de `@nestjs/throttler`. Los elementos más usados son:

| Export            | Tipo      | Descripción                                                                             |
| ----------------- | --------- | --------------------------------------------------------------------------------------- |
| `ThrottlerGuard`  | Guard     | Guard que aplica el rate limiting a las rutas protegidas.                               |
| `SkipThrottle()`  | Decorador | Omite el rate limiting para un controlador o método.                                    |
| `Throttle()`      | Decorador | Sobreescribe los límites de rate limiting para un controlador o método específico.      |
| `ThrottlerModule` | Módulo    | Módulo base de `@nestjs/throttler` (ya configurado internamente por `RateLimitModule`). |

### Token de inyección

| Token                       | Valor                                     | Descripción                                                                                                 |
| --------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `RATE_LIMIT_MODULE_OPTIONS` | `Symbol.for('RATE_LIMIT_MODULE_OPTIONS')` | Token para inyectar las opciones de `ThrottlerModuleOptions` resueltas desde la configuración centralizada. |

#### Ejemplo de uso del token

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { ThrottlerModuleOptions } from '@tresdoce-nestjs-toolkit/rate-limit';
import { RATE_LIMIT_MODULE_OPTIONS } from '@tresdoce-nestjs-toolkit/rate-limit';

@Injectable()
export class MyService {
  constructor(
    @Inject(RATE_LIMIT_MODULE_OPTIONS)
    private readonly rateLimitOptions: ThrottlerModuleOptions,
  ) {}
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
