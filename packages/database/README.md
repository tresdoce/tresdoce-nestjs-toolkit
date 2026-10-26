<div align='left'>
    <img alt="TresdoceLogo" width="180" height="auto" src="https://d1dq91zatgtr9n.cloudfront.net/logos/logoFull.svg"/>
</div>

<div align="center">
    <img alt="Nestjs-logo" width="250" height="auto" src="https://d1dq91zatgtr9n.cloudfront.net/logos/logo-nestjs.svg"/>
</div>

<div align="center">

# Tresdoce NestJS Toolkit<br/>Database

</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Yarn&message=v1.22.22&labelColor=2C8EBB&logoColor=FFFFFF&color=757575&logo=yarn" alt="Yarn"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/>
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/database.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en
la [NestJS Starter](https://github.com/rudemex/nestjs-starter),
siguiendo los lineamientos de arquitectura.

## Glosario

- [📝 Requerimientos básicos](#-requerimientos-básicos)
- [📘 Descripción](#-descripción)
- [🛠️ Instalar dependencia](#-instalar-dependencia)
- [⚙️ Configuración](#-configuración)
- [🐳 MongoDB con Docker Compose](#-docker-compose)
- [👨‍💻 Uso](#-uso)
- [📚 API Reference](#-api-reference)
- [📄 Changelog](./CHANGELOG.md)

---

<a name="-requerimientos-básicos"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- NodeJS v22.22 o superior ([Download](https://nodejs.org/es/download/))
- Yarn v1.22.22
- NestJS v12 o superior ([Documentación](https://nestjs.com/))

<a name="-descripción"></a>

## 📘 Descripción

Este paquete integra MongoDB en aplicaciones NestJS a través de Mongoose y expone un módulo reutilizable para centralizar la conexión y el registro de schemas.

Su objetivo es simplificar la configuración de acceso a MongoDB dentro de aplicaciones construidas sobre el toolkit: arma la URI de conexión a partir de `config.database.mongo` (codificando credenciales), registra la conexión con `@nestjs/mongoose` y re-exporta Mongoose y los decoradores más usados para no tener que instalarlos por separado.

Usalo cuando tu aplicación necesite persistir en MongoDB con Mongoose. Para bases relacionales usá `@tresdoce-nestjs-toolkit/typeorm`.

<a name="-instalar-dependencia"></a>

## 🛠️ Instalar dependencia

```bash
npm install -S @tresdoce-nestjs-toolkit/database
```

```bash
yarn add @tresdoce-nestjs-toolkit/database
```

<a name="-configuración"></a>

## ⚙️ Configuración

`MongoModule` lee sus opciones desde la key `config.database.mongo` del `ConfigService` (tipada como `Typings.AppConfig['database']['mongo']`). El `ConfigModule` tiene que estar registrado como global (`isGlobal: true`) en el `AppModule`.

```typescript
// src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/paas';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => ({
  // ...
  database: {
    mongo: {
      connection: process.env.MONGO_CONNECTION || 'mongodb',
      host: process.env.MONGO_HOST,
      port: parseInt(process.env.MONGO_PORT, 10),
      username: process.env.MONGO_USER,
      password: process.env.MONGO_PASSWORD,
      database: process.env.MONGO_DB_NAME,
      authSource: process.env.MONGO_AUTH_SOURCE,
    },
  },
  // ...
}));
```

```dotenv
# .env
MONGO_CONNECTION=mongodb
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=root
MONGO_PASSWORD=123456
MONGO_DB_NAME=test_db
MONGO_AUTH_SOURCE=admin
```

Con esa configuración, el módulo arma la URI:

```text
mongodb://root:123456@localhost:27017/test_db?authSource=admin
```

> 💬 Ya **no hace falta** envolver los valores con `encodeURIComponent`: el módulo codifica `username`, `password` y `database` automáticamente (por ejemplo `p@ss:word` → `p%40ss%3Aword`). Si los valores ya vienen codificados, se decodifican primero para no codificarlos dos veces, así que las configuraciones existentes siguen funcionando. Además, con `encodeURIComponent(undefined)` se obtenía el string `"undefined"` cuando faltaba la variable de entorno.

Reglas de armado de la URI:

- Si se define `uri`, se usa tal cual y se ignora el resto de las propiedades de la URI.
- Las credenciales solo se agregan si hay `username`; `password` sin `username` se ignora.
- El puerto se omite si no es un número válido o si `connection` es `mongodb+srv`.
- `authSource` y `params` se agregan como query string (`/?authSource=admin&replicaSet=rs0`).
- Si no hay `host` ni `uri`, o falta `config.database.mongo`, el módulo lanza un error al iniciar.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`uri`: URI completa de conexión. Tiene prioridad sobre el resto de las propiedades.

- Type: `string`
- Example: `mongodb+srv://user:pass@cluster0.example.net/db?retryWrites=true`

`connection`: Protocolo de conexión a MongoDB.

- Type: `string`
- Values: `mongodb | mongodb+srv`
- Default: `mongodb`

`host`: Servidor de conexión a MongoDB. Para un replica set se puede pasar la lista de hosts (`host1:27017,host2:27017`, sin `port`). Requerido si no se define `uri`.

- Type: `string`
- Values: `localhost | 127.0.0.1 | <mongo-host>`

`port`: Puerto de conexión a MongoDB. Es opcional y se ignora con `mongodb+srv`.

- Type: `number`
- Example: `27017`

`username`: Nombre de usuario para conectarse a MongoDB. Se codifica automáticamente.

- Type: `string`

`password`: Contraseña del usuario. Solo se usa junto con `username` y se codifica automáticamente.

- Type: `string`

`database`: Nombre de la base de datos MongoDB.

- Type: `string`

`authSource`: Nombre de la base de datos asociada a las credenciales del usuario.

- Type: `string`
- Example: `admin`

`params`: Parámetros extra que se agregan al query string de la URI. Se omiten los valores `undefined` o `null`.

- Type: `Record<string, string | number | boolean>`
- Example: `{ replicaSet: 'rs0', retryWrites: true, maxPoolSize: 10 }`

`connectionOptions`: Opciones extra que se pasan a `MongooseModule.forRootAsync` (todas las de `ConnectOptions` de Mongoose más `retryAttempts`, `retryDelay`, `lazyConnection`, `onConnectionCreate`, etc. de `@nestjs/mongoose`).

- Type: `Omit<MongooseModuleFactoryOptions, 'uri'>`
- Example: `{ serverSelectionTimeoutMS: 5000, retryAttempts: 3 }`

</details>

<a name="-docker-compose"></a>

### 🐳 MongoDB con Docker Compose

Para levantar un MongoDB local compatible con el `.env` de ejemplo:

```yaml
# docker-compose.yml
services:
  mongo:
    image: mongo:8.0
    container_name: mongo
    restart: unless-stopped
    ports:
      - '27017:27017'
    environment:
      TZ: 'America/Argentina/Buenos_Aires'
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: 123456
      MONGO_INITDB_DATABASE: test_db
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

```bash
docker compose up -d mongo
```

> 💬 El usuario root se crea en la base `admin`, por eso `MONGO_AUTH_SOURCE=admin`.

<a name="-uso"></a>

## 👨‍💻 Uso

Importar `MongoModule` una sola vez en el `app.module.ts`. Es un módulo `@Global()`: resuelve la configuración y abre la conexión automáticamente.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from '@tresdoce-nestjs-toolkit/database';
import configuration from './config/configuration.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongoModule,
    CatsModule,
  ],
})
export class AppModule {}
```

### Definir un schema

Con los decoradores de `@nestjs/mongoose` (`Prop` y `SchemaFactory` se re-exportan desde este paquete; el decorador `@Schema()` se importa desde `@nestjs/mongoose` porque `Schema` es la clase de Mongoose):

```typescript
// src/cats/entities/cat.entity.ts
import { Schema } from '@nestjs/mongoose';
import { Prop, SchemaFactory } from '@tresdoce-nestjs-toolkit/database';
import type { HydratedDocument } from '@tresdoce-nestjs-toolkit/database';

@Schema({ timestamps: true })
export class Cat {
  @Prop({ required: true })
  name: string;

  @Prop()
  age?: number;
}

export type CatDocument = HydratedDocument<Cat>;
export const CatSchema = SchemaFactory.createForClass(Cat);
```

O directamente con Mongoose, que este paquete re-exporta:

```typescript
// src/cats/entities/cat.entity.ts
import { Schema } from '@tresdoce-nestjs-toolkit/database';

export interface Cat {
  name: string;
  age?: number;
}

export const CatSchema = new Schema<Cat>({
  name: { type: String, required: true },
  age: Number,
});
```

### Registrar schemas en un módulo

```typescript
// src/cats/cats.module.ts
import { Module } from '@nestjs/common';
import { MongoModule } from '@tresdoce-nestjs-toolkit/database';
import { Cat, CatSchema } from './entities/cat.entity.js';
import { CatsService } from './cats.service.js';
import { CatsController } from './cats.controller.js';

@Module({
  imports: [MongoModule.forFeature([{ name: Cat.name, schema: CatSchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

### Inyectar el model en un servicio

```typescript
// src/cats/cats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@tresdoce-nestjs-toolkit/database';
import type { Model } from '@tresdoce-nestjs-toolkit/database';
import { Cat } from './entities/cat.entity.js';

@Injectable()
export class CatsService {
  constructor(@InjectModel(Cat.name) private readonly catModel: Model<Cat>) {}

  async create(cat: Cat) {
    return this.catModel.create(cat);
  }

  async findAll() {
    return this.catModel.find().lean().exec();
  }
}
```

Respuesta de ejemplo de un `GET /cats` que devuelve `findAll()`:

```json
[
  {
    "_id": "6718f2c4e1b2a3c4d5e6f701",
    "name": "Michi",
    "age": 3,
    "createdAt": "2026-10-25T13:00:00.000Z",
    "updatedAt": "2026-10-25T13:00:00.000Z",
    "__v": 0
  }
]
```

### Acceder a la conexión

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@tresdoce-nestjs-toolkit/database';
import type { Connection } from '@tresdoce-nestjs-toolkit/database';

@Injectable()
export class DbInfoService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getStatus() {
    return { name: this.connection.name, readyState: this.connection.readyState };
  }
}
```

```json
{ "name": "test_db", "readyState": 1 }
```

### Construir la URI manualmente

```typescript
import { buildMongoUri } from '@tresdoce-nestjs-toolkit/database';

buildMongoUri({
  host: 'localhost',
  port: 27017,
  username: 'us@er',
  password: 'p@ss',
  authSource: 'admin',
});
// 'mongodb://us%40er:p%40ss@localhost:27017/?authSource=admin'
```

### Re-export de Mongoose (ESM)

El paquete hace `export * from 'mongoose'` y además exporta la instancia completa como `mongoose`:

```typescript
import { Schema, Types, isValidObjectId, mongoose } from '@tresdoce-nestjs-toolkit/database';

isValidObjectId('6718f2c4e1b2a3c4d5e6f701'); // true
new Types.ObjectId();
mongoose.set('strictQuery', true);
```

> ⚠️ Mongoose es CommonJS: en ESM, `export *` solo incluye los named exports que Node detecta. Propiedades como `connection`, `models`, `plugins` o `events` **no** llegan como named exports (TypeScript las ve, pero en runtime son `undefined`); usalas a través de `mongoose.connection`, etc. Tené en cuenta que la conexión que abre `MongoModule` no es `mongoose.connection` sino la que se obtiene con `@InjectConnection()`.

> 💬 Para más información, puedes consultar la [documentación oficial de NestJS](https://docs.nestjs.com/techniques/mongodb).

<a name="-api-reference"></a>

## 📚 API Reference

| Export                                                                                            | Tipo      | Descripción                                                                                                       |
| ------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `MongoModule`                                                                                     | Module    | Módulo `@Global()` que conecta a MongoDB leyendo `config.database.mongo`. Exporta `MongooseModule`.               |
| `MongoModule.forFeature(models)`                                                                  | Método    | Registra schemas (`ModelDefinition[]`) para inyectarlos con `@InjectModel`. Alias de `MongooseModule.forFeature`. |
| `mongoOptionsFactory(configService)`                                                              | Función   | Factory usada por el módulo: devuelve `{ ...connectionOptions, uri }`. Útil para `MongooseModule.forRootAsync`.   |
| `MONGO_CONFIG_KEY`                                                                                | Constante | `'config.database.mongo'`.                                                                                        |
| `buildMongoUri(options)`                                                                          | Función   | Arma la URI a partir de `MongoModuleOptions`.                                                                     |
| `encodeUriComponent(value)`                                                                       | Función   | `encodeURIComponent` idempotente (no codifica dos veces).                                                         |
| `MongoModuleOptions`, `MongoUriParam`                                                             | Tipos     | Opciones de configuración (ver [Configuración](#-configuración)).                                                 |
| `InjectModel`, `InjectConnection`, `Prop`, `SchemaFactory`, `getModelToken`, `getConnectionToken` | Re-export | Desde `@nestjs/mongoose`.                                                                                         |
| `ModelDefinition`                                                                                 | Tipo      | Desde `@nestjs/mongoose`.                                                                                         |
| `mongoose`                                                                                        | Re-export | Instancia por defecto de Mongoose (`import mongoose from 'mongoose'`).                                            |
| `*` de `mongoose`                                                                                 | Re-export | `Schema`, `Types`, `Model`, `Document`, `HydratedDocument`, `isValidObjectId`, etc.                               |

```typescript
interface MongoModuleOptions {
  uri?: string;
  connection?: string; // 'mongodb' | 'mongodb+srv', default 'mongodb'
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  authSource?: string;
  params?: Record<string, string | number | boolean>;
  connectionOptions?: Omit<MongooseModuleFactoryOptions, 'uri'>;
}
```

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<br/>
<div align="center">
    <p>
        <br/><img src="https://d1dq91zatgtr9n.cloudfront.net/logos/logoIcon.svg" width="84" alt="TresdoceIcon" /><br/>
        Made with ❤
    </p>
</div>
