<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Redis</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
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
- [🐳 Redis local con Docker](#docker)
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
- Redis 5.0 or higher (Docker para desarrollo local, ver [🐳 Redis local con Docker](#docker))

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

`RedisModule` lee la configuración desde `ConfigService` con la key **`config.redis`** (`Typings.AppConfig['redis']`,
de tipo `RedisOptions`). El `ConfigModule` debe estar registrado con `isGlobal: true` en el `AppModule`.

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

// Evita mandar el string "undefined" cuando la variable no está definida.
const encode = (value?: string) => (value ? encodeURIComponent(value) : undefined);

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    redis: {
      name: process.env.REDIS_NAME,
      protocol: process.env.REDIS_PROTOCOL ?? 'redis',
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      username: encode(process.env.REDIS_USERNAME),
      password: encode(process.env.REDIS_PASSWORD),
      database: process.env.REDIS_DATABASE ? parseInt(process.env.REDIS_DATABASE, 10) : undefined,
    },
    //...
  };
});
```

```bash
# .env
REDIS_NAME=my-app
REDIS_PROTOCOL=redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=123456
REDIS_DATABASE=0
```

| Variable         | Descripción                               | Ejemplo     |
| ---------------- | ----------------------------------------- | ----------- |
| `REDIS_NAME`     | Nombre del cliente (`CLIENT SETNAME`)     | `my-app`    |
| `REDIS_PROTOCOL` | `redis` o `rediss` (TLS)                  | `redis`     |
| `REDIS_HOST`     | Host del servidor                         | `localhost` |
| `REDIS_PORT`     | Puerto del servidor                       | `6379`      |
| `REDIS_USERNAME` | Usuario ACL (opcional)                    | `default`   |
| `REDIS_PASSWORD` | Contraseña (opcional)                     | `123456`    |
| `REDIS_DATABASE` | Número de base de datos lógica (opcional) | `0`         |

### URL de conexión

El módulo construye la URL de conexión a partir de las opciones y se la pasa a `createClient` de
[node-redis](https://github.com/redis/node-redis) junto con el resto de las opciones:

```
redis[s]://[[username][:password]@][host][:port][/db-number]
```

| Opciones                                                                                   | URL resultante                   |
| ------------------------------------------------------------------------------------------ | -------------------------------- |
| `{ host: 'localhost', port: 6379 }`                                                        | `redis://localhost:6379`         |
| `{ host: 'localhost', port: 6379, password: '123456' }`                                    | `redis://:123456@localhost:6379` |
| `{ host: 'localhost', port: 6379, username: 'default' }`                                   | `redis://default@localhost:6379` |
| `{ protocol: 'rediss', host: 'h', port: 6380, username: 'u', password: 'p', database: 2 }` | `rediss://u:p@h:6380/2`          |

> ⚠️ `username` y `password` se insertan tal cual en la URL y node-redis los decodifica con `decodeURIComponent`.
> Si contienen caracteres especiales (`@`, `:`, `/`, `#`, `%`…), pasalos con `encodeURIComponent`, como en el
> ejemplo de arriba. Los valores que salen de la URL tienen prioridad sobre los mismos campos pasados como opciones.

> ⚠️ Con `protocol: 'rediss'` la conexión usa TLS. Si además pasás `socket.tls`, tiene que coincidir con el
> protocolo o node-redis lanza un `TypeError`.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`name`: Nombre del cliente que se registra en Redis (`CLIENT SETNAME`).

- Type: `String`
- Required: `false`
- Default: UUID generado automáticamente (`crypto.randomUUID()`)

`protocol`: Protocolo de conexión.

- Type: `String`
- Required: `false`
- Default: `redis`
- Values: `redis | rediss`

`host`: Servidor para conectarse a Redis.

- Type: `String`
- Required: `true`

`port`: Puerto para conectarse a Redis.

- Type: `Number`
- Required: `true`

`username`: Usuario ACL para conectarse a Redis. Si no se envía, Redis usa el usuario `default`.

- Type: `String`
- Required: `false`

`password`: Contraseña para conectarse a Redis.

- Type: `String`
- Required: `false`

`database`: Número de base de datos lógica.

- Type: `Number`
- Required: `false`
- Default: `0`

Además se acepta cualquier opción de `RedisClientOptions` (`socket`, `RESP`, `commandOptions`, `pingInterval`,
etc.). Para más información, consultar el
[Client Configuration](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md) de node-redis.

</details>

<a name="docker"></a>

### 🐳 Redis local con Docker

Para desarrollo local podés levantar Redis con `docker compose up -d`.

Con contraseña (equivale a `REDIS_PASSWORD=123456`):

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7.4-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456']
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

Sin contraseña (no definas `REDIS_USERNAME` ni `REDIS_PASSWORD`):

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7.4-alpine
    container_name: redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    command: ['redis-server', '--appendonly', 'yes']
```

Verificación rápida:

```bash
docker compose exec redis redis-cli -a 123456 ping   # con contraseña
docker compose exec redis redis-cli ping             # sin contraseña
# PONG
```

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo (configuración centralizada)

Importar el `RedisModule` en el `AppModule`. El módulo es `@Global()`, así que `RedisService` y `REDIS_CLIENT`
quedan disponibles en toda la aplicación.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

import config from './config/configuration.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] }), RedisModule],
})
export class AppModule {}
```

### Importación estática con `register`

Para proyectos que no usan la configuración centralizada:

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '@tresdoce-nestjs-toolkit/redis';

@Module({
  imports: [
    RedisModule.register({
      host: 'localhost',
      port: 6379,
      password: '123456',
    }),
  ],
})
export class AppModule {}
```

### Ciclo de vida de la conexión

- El cliente se crea y se conecta (`await client.connect()`) al inicializar el módulo: si Redis no está disponible,
  el bootstrap de la app espera/reintenta según la `reconnectStrategy` de node-redis.
- Los listeners de `connect`, `ready` y `error` se registran **antes** de conectar, por lo que se loguean desde el
  primer intento y los errores nunca quedan sin manejar.
- Al cerrar la aplicación (`app.close()` o señales con `app.enableShutdownHooks()`), `onModuleDestroy` llama a
  `client.close()` (espera los comandos pendientes) solo si el cliente sigue abierto.

Logs esperados:

```
[Nest] 12345  - 25/10/2026, 10:00:00     LOG [RedisModule] Connected to Redis successfully!
[Nest] 12345  - 25/10/2026, 10:00:00     LOG [RedisModule] Redis is ready!
[Nest] 12345  - 25/10/2026, 10:00:05   ERROR [RedisModule] Could not establish a connection with Redis: connect ECONNREFUSED 127.0.0.1:6379
```

### Uso con `RedisService`

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@tresdoce-nestjs-toolkit/redis';

interface Cat {
  id: number;
  name: string;
}

@Injectable()
export class CatService {
  constructor(private readonly redisService: RedisService) {}

  async findOne(id: number): Promise<Cat> {
    const key = `cat:${id}`;
    const cached = await this.redisService.get<Cat>(key);
    if (cached) return cached;

    const cat: Cat = { id, name: 'Michi' }; // ej: leído de la base de datos
    await this.redisService.set(key, cat, 60); // TTL de 60 segundos
    return cat;
  }

  async invalidate(id: number): Promise<boolean> {
    return this.redisService.del(`cat:${id}`);
  }
}
```

Respuesta HTTP de ejemplo de un controller que devuelve `findOne(1)`:

```json
{
  "id": 1,
  "name": "Michi"
}
```

### Uso con el cliente `REDIS_CLIENT`

Para acceder a todos los comandos de Redis, inyectar el cliente nativo con el token `REDIS_CLIENT`
(o usar `redisService.clientRef`):

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT, type RedisClientType } from '@tresdoce-nestjs-toolkit/redis';

@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  async saveUser(): Promise<number> {
    return this.redisClient.hSet('user:1', { name: 'Mex', role: 'admin' }); // 2
  }
}
```

### Comandos disponibles en `RedisService`

Los valores se serializan con `JSON.stringify` al guardar y se deserializan con `JSON.parse` al leer.

#### Echo

```typescript
await this.redisService.echo('Hello world!'); // 'Hello world!'
```

#### Exists

```typescript
await this.redisService.exists('myKey'); // true | false
```

#### Set

Guarda un `value` (cualquier valor serializable a JSON) asociado a una `key`. Si `seconds` es un número finito
mayor a `0` se usa `SETEX` (expira en esos segundos); con `0`, negativo, `NaN`, `Infinity` o `undefined` se guarda
**sin expiración** con `SET`. `seconds` debe ser un entero (Redis rechaza decimales).

```typescript
await this.redisService.set('myKey', 'my value'); // 'OK'
await this.redisService.set('myKey', { key: 'value' }); // 'OK'
await this.redisService.set('myKey', 'my value', 10); // 'OK' — expira en 10 segundos
```

#### Get

Retorna el valor deserializado de la `key`, tipable con un genérico. Devuelve `null` si la key no existe (o está
vacía). Si el valor guardado no es JSON válido (por ejemplo, escrito por otro cliente), se devuelve el string crudo.

```typescript
await this.redisService.get<{ key: string }>('myKey'); // { key: 'value' }
await this.redisService.get('notExists'); // null
await this.redisService.get('rawKey'); // 'plain-text' (valor no JSON)
```

#### Del

```typescript
await this.redisService.del('myKey'); // true si se eliminó, false si no existía
```

#### Copy

```typescript
await this.redisService.copy('myKey', 'myKeyCopy'); // true | false (false si el destino ya existe)
```

#### Rename

```typescript
await this.redisService.rename('myKeyCopy', 'myKey2'); // 'OK'
```

#### FlushAll

Elimina **todos** los datos de todas las bases del servidor Redis.

```typescript
await this.redisService.flushAll(); // 'OK'
```

<a name="api-reference"></a>

## 📖 API Reference

### `RedisModule`

Módulo global (`@Global()`). Exporta `REDIS_CLIENT` y `RedisService`. Implementa `OnModuleDestroy` para cerrar el
cliente.

| Uso                                           | Descripción                                                        |
| --------------------------------------------- | ------------------------------------------------------------------ |
| `RedisModule`                                 | Carga la configuración desde `ConfigService` (key `config.redis`). |
| `RedisModule.register(options: RedisOptions)` | Inicialización estática con opciones directas.                     |

### `RedisService`

| Miembro     | Firma                                                             | Descripción                                        |
| ----------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `clientRef` | `get clientRef(): RedisClientType`                                | Cliente node-redis nativo                          |
| `echo`      | `(msg: string) => Promise<string>`                                | Retorna la cadena enviada                          |
| `exists`    | `(key: string) => Promise<boolean>`                               | Verifica si una key existe                         |
| `set`       | `(key: string, value: unknown, seconds?: number) => Promise<any>` | Guarda el valor en JSON (con TTL si `seconds > 0`) |
| `get`       | `<T = any>(key: string) => Promise<T \| null>`                    | Obtiene el valor deserializado (o el string crudo) |
| `del`       | `(key: string) => Promise<boolean>`                               | Elimina una key                                    |
| `copy`      | `(source: string, destination: string) => Promise<boolean>`       | Copia una key con nuevo nombre                     |
| `rename`    | `(key: string, newKey: string) => Promise<string>`                | Renombra una key                                   |
| `flushAll`  | `() => Promise<string>`                                           | Borra todos los datos del servidor                 |

### `RedisOptions`

Extiende `RedisClientOptions` de node-redis.

| Campo      | Tipo     | Requerido | Default   | Descripción                    |
| ---------- | -------- | --------- | --------- | ------------------------------ |
| `host`     | `string` | Sí        | —         | Servidor Redis                 |
| `port`     | `number` | Sí        | —         | Puerto Redis                   |
| `protocol` | `string` | No        | `'redis'` | Protocolo (`redis` o `rediss`) |
| `username` | `string` | No        | —         | Usuario ACL                    |
| `password` | `string` | No        | —         | Contraseña                     |
| `database` | `number` | No        | `0`       | Número de base de datos        |
| `name`     | `string` | No        | UUID      | Nombre del cliente             |

### Constantes exportadas

| Constante                          | Valor / Descripción                                      |
| ---------------------------------- | -------------------------------------------------------- |
| `REDIS_CLIENT`                     | `Symbol` — token de inyección del cliente nativo         |
| `REDIS_MODULE_OPTIONS`             | `Symbol` — token de inyección de las opciones del módulo |
| `REDIS_MSG_IS_READY`               | `'Redis is ready!'`                                      |
| `REDIS_MSG_SUCCESSFULLY_CONNECTED` | `'Connected to Redis successfully!'`                     |
| `REDIS_MSG_ERROR_CONNECTED`        | `'Could not establish a connection with Redis:'`         |

### Re-exportaciones

Este paquete re-exporta la librería `redis` completa (`export * from 'redis'`), así que `createClient`,
`RedisClientType`, `RedisClientOptions`, los tipos de error, etc. pueden importarse desde
`@tresdoce-nestjs-toolkit/redis`.

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
