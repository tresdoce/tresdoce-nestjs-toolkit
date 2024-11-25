<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Redis</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.18.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v10.9.1&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.4.9&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
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
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v20.18.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.19 or higher
- NPM v10.9.1 or higher
- NestJS v10.4.9 or higher ([Documentación](https://nestjs.com/))
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
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
