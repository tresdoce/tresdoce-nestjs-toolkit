<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Redis</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/redis.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

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
- Redis 5.0 or higher

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/redis
```

```
yarn add @tresdoce-nestjs-toolkit/redis
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a Redis en `configuration.ts` utilizando el key `redis` con los datos de conexión
desde las variables de entorno.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    redis: {
      name: encodeURIComponent(process.env.REDIS_NAME),
      host: encodeURIComponent(process.env.REDIS_HOST),
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      username: encodeURIComponent(process.env.REDIS_USERNAME),
      password: encodeURIComponent(process.env.REDIS_PASSWORD),
    },
    //...
  };
});
```

### URL de conexión

El módulo construye automáticamente la URL de conexión a partir de los parámetros de configuración
usando el formato:

```
redis[s]://[[username][:password]@][host][:port][/db-number]
```

Por ejemplo, con `protocol: 'redis'`, `host: 'localhost'` y `port: 6379` sin credenciales,
la URL resultante será `redis://localhost:6379`.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`name`: Nombre lógico de la conexión Redis. Se usa como identificador interno del cliente.

- Type: `String`
- Required: `false`
- Default: UUID generado automáticamente

`protocol`: Protocolo de conexión.

- Type: `String`
- Required: `false`
- Default: `redis`
- Values: `redis | rediss`

`host`: Servidor para conectarse a Redis.

- Type: `String`
- Required: `true`
- Values: `localhost | 127.0.0.1 | <host>`

`port`: Puerto para conectarse a Redis.

- Type: `Number`
- Required: `true`
- Default: `6379`

`username`: Nombre de usuario para conectarse a Redis.

- Type: `String`
- Required: `false`
- Default: `default`

`password`: Contraseña de usuario para conectarse a Redis.

- Type: `String`
- Required: `false`

`database`: Base de datos de Redis (número de DB).

- Type: `number`
- Required: `false`
- Default: `0`

Para más información sobre los parámetros de conexión, consultar
el [Client Configuration](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md) de Redis.

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo (configuración centralizada)

Importar el `RedisModule` en el archivo `app.module.ts`. El módulo es `@Global()` y obtiene la configuración
automáticamente desde `ConfigService` (key `config.redis`).

```typescript
//./src/app.module.ts
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

@Module({
  //...
  imports: [
    //...
    RedisModule,
    //...
  ],
  //...
})
export class AppModule {}
```

### Importación estática con `register`

Para proyectos que no usan la configuración centralizada, se puede registrar el módulo con opciones directas:

```typescript
//./src/app.module.ts
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

@Module({
  imports: [
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      password: 'mypassword',
    }),
  ],
})
export class AppModule {}
```

### Uso con `RedisService`

Inyectar el `RedisService` en el servicio para interactuar con Redis mediante los métodos de alto nivel:

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@tresdoce-nestjs-toolkit/redis';

@Injectable()
export class CatService {
  constructor(private readonly redisService: RedisService) {}

  async redisEcho() {
    return await this.redisService.echo('Hello world!');
  }
}
```

### Uso con el cliente `REDIS_CLIENT`

Si necesitas acceso a todos los comandos de Redis, inyecta directamente el cliente nativo usando
el token `REDIS_CLIENT`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from '@tresdoce-nestjs-toolkit/redis';
import { RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  async customCommand() {
    // Acceso a todos los comandos de Redis
    return await this.redisClient.hSet('myHash', 'field', 'value');
  }
}
```

### Comandos disponibles en `RedisService`

Si bien Redis tiene una gran cantidad de [comandos](https://redis.io/commands/), el `RedisService` expone
los más utilizados. Para acceder a todos los comandos, inyectar el `REDIS_CLIENT` directamente.

#### Echo

Retorna la cadena de texto enviada.

```typescript
await this.redisService.echo('Hello world!');
```

#### Exists

Retorna un `Boolean` indicando si la `key` existe en Redis.

```typescript
await this.redisService.exists('myKey');
```

#### Set

Guarda un `value` asociado a una `key`. El parámetro `seconds` es opcional e indica el tiempo de expiración.

```typescript
await this.redisService.set('myKey', 'my value');
await this.redisService.set('myKey', { key: 'value' });
await this.redisService.set('myKey', 'my value', 10); // expira en 10 segundos
```

#### Get

Retorna el valor de la `key`. Devuelve `null` si la key no existe.

```typescript
await this.redisService.get('myKey');
```

#### Del

Elimina la `key` y su valor de Redis. Retorna `boolean`.

```typescript
await this.redisService.del('myKey');
```

#### Copy

Copia el valor de una `key` con un nuevo nombre.

```typescript
await this.redisService.copy('myKey', 'myKeyCopy');
```

#### Rename

Renombra una `key` existente.

```typescript
await this.redisService.rename('myKeyCopy', 'myKey2');
```

#### FlushAll

Elimina todos los datos almacenados en Redis.

```typescript
await this.redisService.flushAll();
```

<a name="api-reference"></a>

## 📖 API Reference

### `RedisModule`

Módulo global (`@Global()`). Exporta `REDIS_CLIENT` y `RedisService`.

| Método                                        | Descripción                                                        |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `RedisModule` (sin argumentos)                | Carga la configuración desde `ConfigService` (key `config.redis`). |
| `RedisModule.register(options: RedisOptions)` | Inicialización estática con opciones directas.                     |

### `RedisService`

| Método      | Firma                                                         | Descripción                                 |
| ----------- | ------------------------------------------------------------- | ------------------------------------------- |
| `clientRef` | `get clientRef(): RedisClientType`                            | Getter que expone el cliente Redis nativo   |
| `echo`      | `(msg: string) => Promise<string>`                            | Retorna la cadena enviada                   |
| `exists`    | `(key: string) => Promise<boolean>`                           | Verifica si una key existe                  |
| `set`       | `(key: string, value: any, seconds?: number) => Promise<any>` | Guarda un valor (serializado a JSON)        |
| `get`       | `(key: string) => Promise<any>`                               | Obtiene un valor (deserializado desde JSON) |
| `del`       | `(key: string) => Promise<boolean>`                           | Elimina una key                             |
| `copy`      | `(source: string, destination: string) => Promise<boolean>`   | Copia una key con nuevo nombre              |
| `rename`    | `(key: string, newKey: string) => Promise<string>`            | Renombra una key                            |
| `flushAll`  | `() => Promise<string>`                                       | Borra toda la base de datos Redis           |

### `RedisOptions`

Extiende `RedisClientOptions` de la librería `redis`.

| Campo      | Tipo     | Requerido | Default     | Descripción                    |
| ---------- | -------- | --------- | ----------- | ------------------------------ |
| `host`     | `string` | Sí        | —           | Servidor Redis                 |
| `port`     | `number` | Sí        | `6379`      | Puerto Redis                   |
| `protocol` | `string` | No        | `'redis'`   | Protocolo (`redis` o `rediss`) |
| `username` | `string` | No        | `'default'` | Usuario Redis                  |
| `password` | `string` | No        | —           | Contraseña Redis               |
| `database` | `number` | No        | `0`         | Número de base de datos        |
| `name`     | `string` | No        | UUID        | Nombre lógico de la conexión   |

### Constantes exportadas

| Constante                          | Descripción                                                     |
| ---------------------------------- | --------------------------------------------------------------- |
| `REDIS_CLIENT`                     | Token de inyección del cliente Redis nativo (`RedisClientType`) |
| `REDIS_MODULE_OPTIONS`             | Token de inyección de las opciones del módulo                   |
| `REDIS_MSG_IS_READY`               | Mensaje de log cuando Redis está listo                          |
| `REDIS_MSG_SUCCESSFULLY_CONNECTED` | Mensaje de log cuando la conexión es exitosa                    |
| `REDIS_MSG_ERROR_CONNECTED`        | Mensaje de log cuando ocurre un error de conexión               |

### Re-exportaciones

Este paquete re-exporta completamente la librería `redis` (`export * from 'redis'`), por lo que todos los tipos,
interfaces y funciones de `redis` (como `RedisClientType`, `createClient`, etc.) pueden importarse directamente
desde `@tresdoce-nestjs-toolkit/redis`.

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
