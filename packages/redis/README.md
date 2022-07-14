<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Redis</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v9.0.0&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/redis.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJs Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://rudemex-nestjs-starter.herokuapp.com/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.17 or higher
- NPM v6.14.13 or higher
- NestJS v9.0.0 or higher ([Documentación](https://nestjs.com/))
- Redis 5.0 or higher

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/redis
```

```
yarn add @tresdoce-nestjs-toolkit/redis
```

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a la Redis en `configuration.ts` utilizando el key `redis` y que contenga el
objeto con los datos conexión desde las variables de entorno.

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

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`name`: Es el nombre de la Redis.

- Type: `String`
- Required: `false`

`protocol`: Es el protocolo de conexión de la Redis.

- Type: `String`
- Required: `false`
- Default: `redis`
- Values: `redis | rediss`

`host`: Es el servidor para conectarse a la Redis.

- Type: `String`
- Required: `true`
- Values: `localhost | 127.0.0.1 | <host>`

`port`: Es el puerto para conectarse a la Redis.

- Type: `Number`
- Required: `true`
- Default: `6379`

`username`: Es el nombre de usuario para conectarse a la Redis.

- Type: `String`
- Required: `false`
- Default: `default`

`password`: Es la contraseña de usuario para conectarse a la Redis.

- Type: `String`
- Required: `false`

`database`: Es la base de datos de la Redis.

- Type: `number`
- Required: `false`
- Default: `0`

Para más información sobre los parámetros de conexión, puedes consultar en
el [Client Configuration](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md) de Redis.

</details>

<a name="use"></a>

## 👨‍💻 Uso

Importar el `RedisModule` en el archivo `app.module.ts`, y el módulo se encargará de obtener la configuración
y realizar la connexion automáticamente.

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

Luego inyecte el `RedisService` en su clase para poder interactuar con el cliente de Redis.

```typescript
import { Injectable } from '@nestjs/common';
import { RedisService } from '@tresdoce-nestjs-toolkit/redis';

@Injectable()
export class CatService {
  constructor(private readonly redisService: RedisService) {}

  async redisEcho() {
    return await this.redisService.echo('Hello world!');
  }

  //...
}
```

### Comandos

Si bien Redis tiene una gran cantidad de [comandos](https://redis.io/commands/), este módulo solo tiene habilitado los
comandos más utilizados al momento de desarrollar una aplicación, pero de todas formas, puedes inyectar
el `REDIS_CLIENT`
en vez del servicio e interactuar con todos los comandos.

#### Echo

Retorna una cadena de texto que le envies.

```typescript
await this.redisService.echo('Hello world!');
```

#### Exists

Retorna un `Boolean` si el `key` existe en la Redis.

```typescript
await this.redisService.exists('myKey');
```

#### Set

Guarda en la Redis un `value` asociado a una `key`, y tiene como parámetro opcional el tiempo de expiración en segundos.

```typescript
await this.redisService.set('myKey', 'my value');
await this.redisService.set('myKey', { key: 'value' });
await this.redisService.set('myKey', 'my value', 10);
```

#### Get

Retorna el `value` de la `key` guardado en la Redis.

```typescript
await this.redisService.get('myKey');
```

#### Del

Elimina el `value` y `key` guardado en la Redis.

```typescript
await this.redisService.del('myKey');
```

#### Copy

Copia el `value` de una `key` y guarda en la Redis con el nuevo nombre.

```typescript
await this.redisService.copy('myKey', 'myKeyCopy');
```

#### Rename

Renombra una `key` en la Redis con el nuevo nombre.

```typescript
await this.redisService.rename('myKeyCopy', 'myKey2');
```

#### FlushAll

Elimina todos los datos guardados en la Redis.

```typescript
await this.redisService.flushAll();
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="../../.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
