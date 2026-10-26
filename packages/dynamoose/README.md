<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Dynamoose</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/dynamoose.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Integra [Dynamoose](https://dynamoosejs.com/) (ODM para Amazon DynamoDB) con NestJS: configura el cliente de DynamoDB
(AWS SDK v3) a partir de la key `dynamodb` de la configuración centralizada, registra los modelos como providers
inyectables (`@InjectModel()`) y expone tipos para trabajar con modelos, queries, scans y transacciones. Usalo cuando tu
servicio persista datos en DynamoDB (en AWS o en DynamoDB Local para desarrollo y tests).

El paquete se distribuye **solo como ESM** (`"type": "module"`).

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [🐳 DynamoDB local con Docker](#docker)
- [⚙️ Configuración](#configurations)
- [👨‍💻 Uso](#use)
- [📚 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Para desarrollo local: [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) (ver [🐳 DynamoDB local con Docker](#docker))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/dynamoose
```

```
yarn add @tresdoce-nestjs-toolkit/dynamoose
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

Dependencias principales: `dynamoose`, `dynamoose-logger` y `@aws-sdk/client-dynamodb`. El módulo usa `ConfigService`
de `@nestjs/config`, que debe estar registrado como global en la aplicación (`ConfigModule.forRoot({ isGlobal: true })`).

> 💡 `dynamoose` es un paquete CommonJS. En ESM importalo con el **default import** (`import dynamoose from 'dynamoose'`):
> el namespace (`import * as dynamoose`) no expone `aws`, `transaction` ni `logger`. Los named imports que sí detecta Node
> (por ejemplo `import { Schema } from 'dynamoose'`) funcionan sin problema.

<a name="docker"></a>

## 🐳 DynamoDB local con Docker

Para desarrollar localmente podés levantar [DynamoDB Local](https://hub.docker.com/r/amazon/dynamodb-local) con el
siguiente `docker-compose.yml`:

```yaml
services:
  dynamodb:
    image: amazon/dynamodb-local:2.6.0
    container_name: dynamodb-local
    restart: unless-stopped
    ports:
      - '8000:8000'
    # -inMemory: los datos se pierden al reiniciar. Quitalo y montá un volumen si querés persistirlos.
    command: '-jar DynamoDBLocal.jar -sharedDb -inMemory'
```

```bash
docker compose up -d dynamodb
```

Y las variables de entorno de tu app:

```dotenv
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
AWS_REGION=us-east-1
AWS_DYNAMO_URL=http://localhost:8000
```

> DynamoDB Local acepta cualquier par de credenciales, pero el AWS SDK exige que existan; con `-sharedDb` todas las
> credenciales/regiones comparten la misma base.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a DynamoDB en `configuration.ts` utilizando la key `dynamodb` de `Typings.AppConfig`
(tipo `DynamooseModuleOptions`), con los datos de conexión tomados de las variables de entorno. `DynamooseModule` la lee
con `configService.get('config.dynamodb')`.

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import PACKAGE_JSON from '../../package.json' with { type: 'json' };

const isProd = process.env.NODE_ENV === 'production';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    dynamodb: {
      // true usa http://localhost:8000; también acepta la URL del endpoint
      local: isProd ? false : process.env.AWS_DYNAMO_URL || true,
      logger: !isProd,
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      },
      table: {
        create: !isProd,
        prefix: `${PACKAGE_JSON.name}-`,
        suffix: '-table',
      },
    },
    //...
  };
});
```

Validación opcional de las variables con Zod:

```typescript
import { z } from 'zod';
import { validateSchemaForApp } from '@tresdoce-nestjs-toolkit/paas';

ConfigModule.forRoot({
  isGlobal: true,
  load: [config],
  validationSchema: validateSchemaForApp({
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_REGION: z.string().default('us-east-1'),
    AWS_DYNAMO_URL: z.url().optional(),
  }),
});
```

#### Cómo se arma el cliente de DynamoDB

Al iniciar, el módulo configura la instancia global de Dynamoose (`dynamoose.aws.ddb`) en este orden:

1. Si viene `ddb`, se usa esa instancia tal cual. Si además viene `local`, Dynamoose la reemplaza por un cliente que solo
   tiene el endpoint local (comportamiento de `dynamoose.aws.ddb.local()`).
2. Si no viene `ddb` pero sí `aws` y/o `local`, se crea un `DynamoDB` (AWS SDK v3) con `region`,
   `credentials: { accessKeyId, secretAccessKey }` (solo si vienen ambas) y `endpoint` (si `local` está activo).
3. Si no viene nada, Dynamoose usa la cadena de credenciales por defecto del AWS SDK (variables `AWS_*`, perfil, rol IAM…).
4. `table` se aplica como default para todas las tablas (`dynamoose.Table.defaults.set()`).
5. `logger` registra un provider de [`dynamoose-logger`](https://dynamoosejs.com/other/Logging) que escribe en el logger de Nest.

Si `config.dynamodb` no está definido, el módulo no modifica el cliente.

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`local`: Habilita el uso de DynamoDB de manera local.

- Type: `Boolean | String`
- Default: `false`
- Values: `true | false | http://docker:8000 | http://localhost:8000`

`logger`: Habilita los logs utilizando como provider a `dynamoose-logger`. Con `true` usa un `Logger` de Nest con contexto
`DynamooseModule`; también acepta cualquier `LoggerService` propio.

- Type: `Boolean | LoggerService`
- Default: `false`

`ddb`: Instancia de cliente DynamoDB (`@aws-sdk/client-dynamodb`) para usarla directamente. Cuando se proporciona, tiene precedencia sobre la configuración de `aws`.

- Type: `DynamoDB` (de `@aws-sdk/client-dynamodb`)

#### AWS

Se recomienda usar las variables de entorno estándar del AWS SDK: `AWS_ACCESS_KEY_ID` `AWS_SECRET_ACCESS_KEY` `AWS_REGION`.
Si omitís `accessKeyId`/`secretAccessKey` (por ejemplo, en AWS con un rol IAM), el SDK resuelve las credenciales con su
cadena por defecto.

`accessKeyId`: Es el Access Key ID de aws.

- Type: `String`

`secretAccessKey`: Es el Secret Access Key de aws. Se usa solo junto con `accessKeyId`.

- Type: `String`

`region`: Es la region de la cuenta de aws.

- Type: `String`

#### Table

Esta propiedad solo está pensada para el desarrollo local, ya que para los entornos de AWS se recomienda no utilizarlo.

`create`: Activa la creación de la tabla en DynamoDB en caso de que no exista.

- Type: `Boolean`
- Default: `true`

`prefix`: Es una cadena de texto que se antepone al nombre de la tabla.

- Type: `String`

`suffix`: Es una cadena de texto que se agrega al final del nombre de la tabla.

- Type: `String`

> 💬 Para más información sobre la configuración de este módulo puedes revisar la [Documentación de Dynamoose](https://dynamoosejs.com/getting_started/Configure).

</details>

<a name="use"></a>

## 👨‍💻 Uso

Importar el `DynamooseModule` en el archivo `app.module.ts`. El módulo se encargará de obtener la configuración e
instanciar la conexión automáticamente desde `config.dynamodb`.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from '@tresdoce-nestjs-toolkit/dynamoose';

import config from './config/configuration.js';

@Module({
  //...
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    DynamooseModule,
    //...
  ],
  //...
})
export class AppModule {}
```

### Registro manual con `forRoot()`

Cuando necesites pasar las opciones de manera estática, sin usar la configuración centralizada:

> ⚠️ `forRoot()`/`forRootAsync()` conviven con la inicialización basada en `config.dynamodb` (la que hace `DynamooseModule`
> sin métodos). Usá **uno solo** de los dos mecanismos: si definís `config.dynamodb` y además llamás a `forRoot()`, ambas
> configuraciones se aplican sobre la instancia global de Dynamoose y la última en ejecutarse gana.

```typescript
import { DynamooseModule } from '@tresdoce-nestjs-toolkit/dynamoose';

@Module({
  imports: [
    DynamooseModule.forRoot({
      aws: {
        accessKeyId: 'local',
        secretAccessKey: 'local',
        region: 'us-east-1',
      },
      local: true,
      table: {
        create: true,
        prefix: 'myapp-',
        suffix: '-table',
      },
    }),
  ],
})
export class AppModule {}
```

### Registro async con `forRootAsync()`

Para obtener las opciones de manera asincrónica, por ejemplo desde el `ConfigService`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule, type DynamooseModuleOptions } from '@tresdoce-nestjs-toolkit/dynamoose';

@Module({
  imports: [
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<DynamooseModuleOptions> =>
        configService.get('config.dynamodb'),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

También podés usar `useClass` implementando la interfaz `DynamooseOptionsFactory`:

```typescript
import { Injectable, Module } from '@nestjs/common';
import {
  DynamooseModule,
  type DynamooseModuleOptions,
  type DynamooseOptionsFactory,
} from '@tresdoce-nestjs-toolkit/dynamoose';

@Injectable()
class DynamooseConfigService implements DynamooseOptionsFactory {
  createDynamooseOptions(): DynamooseModuleOptions {
    return {
      aws: {
        accessKeyId: 'local',
        secretAccessKey: 'local',
        region: 'us-east-1',
      },
      local: true,
    };
  }
}

@Module({
  imports: [
    DynamooseModule.forRootAsync({
      useClass: DynamooseConfigService,
    }),
  ],
})
export class AppModule {}
```

### Crear el Schema

```typescript
//./src/users/models/user.schema.ts
import { Schema } from 'dynamoose';

export const UserSchema = new Schema({
  id: {
    type: String,
    hashKey: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
});
```

### Crear el interface del Model

```typescript
//./src/users/interfaces/user.interface.ts
export interface UserKey {
  id: string;
}

export interface User extends UserKey {
  firstName: string;
  lastName: string;
  email: string;
}
```

`UserKey` contiene la `hashKey/partitionKey` y (opcionalmente) la `rangeKey/sortKey`. `User` contiene todos los atributos del
`document/item`. Al crear estas dos interfaces y usarlas al inyectar tu modelo tendrás typechecking al usar operaciones
como `Model.update()`.

### Inyectar los Schemas con `forFeature()`

Se puede inyectar a nivel global en el `app.module.ts`, o bien, en los módulos que requieran utilizar dicho modelo.

```typescript
//./src/users/users.module.ts
import { Module } from '@nestjs/common';
import { DynamooseModule } from '@tresdoce-nestjs-toolkit/dynamoose';

import { UsersController } from './controllers/users.controller.js';
import { UsersService } from './services/users.service.js';
import { UserSchema } from './models/user.schema.js';

@Module({
  imports: [
    DynamooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
        options: {
          tableName: 'user',
        },
        serializers: {
          public: { exclude: ['email'] },
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

### Registro async de modelos con `forFeatureAsync()`

Cuando la definición del schema depende de valores asíncronos (por ejemplo, un servicio inyectado):

```typescript
//./src/users/users.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from '@tresdoce-nestjs-toolkit/dynamoose';
import { Schema } from 'dynamoose';

@Module({
  imports: [
    DynamooseModule.forFeatureAsync([
      {
        name: 'User',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const tablePrefix = configService.get<string>('config.dynamodb.table.prefix');
          return {
            schema: new Schema({
              id: { type: String, hashKey: true },
              email: { type: String },
            }),
            options: {
              tableName: `${tablePrefix}user`,
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
})
export class UsersModule {}
```

La función `useFactory` puede retornar directamente un `Schema | SchemaDefinition`, o un objeto
`{ schema, options?, serializers? }` equivalente a `Omit<ModelDefinition, 'name'>`.

### Inyectar y usar los Models en un servicio

```typescript
//./src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, type Model } from '@tresdoce-nestjs-toolkit/dynamoose';

import type { UserKey, User } from '../interfaces/user.interface.js';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private readonly userModel: Model<User, UserKey>) {}

  async create(user: User) {
    return await this.userModel.create(user);
  }

  async update(key: UserKey, user: Partial<User>) {
    return await this.userModel.update(key, user);
  }

  async findOne(key: UserKey) {
    return await this.userModel.get(key);
  }

  async findByEmail(email: string) {
    return await this.userModel.scan('email').eq(email).exec();
  }

  async findAll() {
    return await this.userModel.scan().exec();
  }

  async findAllPublic() {
    const users = await this.userModel.scan().exec();
    return this.userModel.serializeMany(users, 'public');
  }

  async remove(key: UserKey) {
    await this.userModel.delete(key);
  }
}
```

> El token de inyección es `` `${name}Model` `` (ver `getModelToken`), por lo que el string de `@InjectModel()` debe
> coincidir con el `name` registrado en `forFeature()`/`forFeatureAsync()`.

#### Ejemplos de respuesta

`create()` / `get()` devuelven un `Item` de Dynamoose; al serializarlo como respuesta HTTP se obtiene el objeto plano:

```json
{
  "id": "6b1f2c1e-2b0a-4c5e-9a57-0d3e1f6d2a11",
  "firstName": "Rick",
  "lastName": "Sanchez",
  "email": "rick@citadel.com"
}
```

`get()` con una key inexistente devuelve `undefined`. `scan().exec()` / `query().exec()` devuelven un array con metadata
adicional (`count`, `lastKey`, `scannedCount`/`queriedCount`, `timesScanned`/`timesQueried`); en JSON se ve solo el array:

```json
[
  { "id": "6b1f2c1e-...", "firstName": "Rick", "lastName": "Sanchez", "email": "rick@citadel.com" },
  { "id": "a9c3d7e2-...", "firstName": "Morty", "lastName": "Smith", "email": "morty@earth.com" }
]
```

`serializeMany(users, 'public')` aplica el serializer `public` registrado en `forFeature()` (excluye `email`):

```json
[
  { "id": "6b1f2c1e-...", "firstName": "Rick", "lastName": "Sanchez" },
  { "id": "a9c3d7e2-...", "firstName": "Morty", "lastName": "Smith" }
]
```

#### Logs

Con `logger: true`, los eventos de Dynamoose se escriben en el logger de Nest con contexto `DynamooseModule`, con el
formato `<category> - <message>`:

```
[Nest] 12345  - 25/10/2026, 10:00:00     LOG [DynamooseModule] aws:dynamodb:putItem request - {"Item":{"id":{"S":"6b1f2c1e-..."}},"TableName":"my-app-user-table"}
```

| Nivel de Dynamoose | Método del `LoggerService`                  |
| ------------------ | ------------------------------------------- |
| `fatal`            | `fatal` (o `error` si no está implementado) |
| `error`            | `error`                                     |
| `warn`             | `warn`                                      |
| `info`             | `log`                                       |
| `debug`            | `debug` (o `log` si no está implementado)   |
| `trace`            | `verbose` (o `log` si no está implementado) |

### Transaction

Para usar transacciones, el servicio debe extender `TransactionSupport`:

```typescript
//./src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, TransactionSupport, type Model } from '@tresdoce-nestjs-toolkit/dynamoose';

import type { UserKey, User } from '../interfaces/user.interface.js';

@Injectable()
export class UsersService extends TransactionSupport {
  constructor(@InjectModel('User') private readonly userModel: Model<User, UserKey>) {
    super();
  }

  async replaceUser(oldKey: UserKey, newUser: User) {
    return await this.transaction([
      this.userModel.transaction.delete(oldKey),
      this.userModel.transaction.create(newUser),
    ]);
  }
}
```

`transaction()` delega en `dynamoose.transaction()`; si alguna operación falla, DynamoDB revierte todas (por ejemplo, con
un `TransactionCanceledException`).

### Testing

Para tests unitarios no hace falta DynamoDB: mockeá el modelo con `getModelToken()`.

```typescript
import { Test } from '@nestjs/testing';
import { getModelToken } from '@tresdoce-nestjs-toolkit/dynamoose';

const userModelMock = { get: vi.fn(), create: vi.fn(), scan: vi.fn() };

const module = await Test.createTestingModule({
  providers: [UsersService, { provide: getModelToken('User'), useValue: userModelMock }],
}).compile();
```

> 💬 Este módulo usa como dependencia inyectada a [Dynamoose](https://dynamoosejs.com/getting_started/Introduction), para
> obtener más información sobre su uso podés consultar su documentación.

<a name="api-reference"></a>

## 📚 API Reference

### Exports

| Export                                                                                       | Tipo       | Descripción                                                    |
| -------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------- |
| `DynamooseModule`                                                                            | Módulo     | Módulo global de Dynamoose.                                    |
| `InjectModel`                                                                                | Decorador  | Inyecta un modelo registrado.                                  |
| `getModelToken`                                                                              | Función    | Devuelve el token de inyección de un modelo (`<name>Model`).   |
| `TransactionSupport`                                                                         | Clase      | Clase base con el método `transaction()`.                      |
| `DynamooseModuleOptions`, `DynamooseModuleAsyncOptions`, `DynamooseOptionsFactory`           | Interfaces | Opciones del módulo.                                           |
| `ModelDefinition`, `AsyncModelFactory`                                                       | Tipos      | Definición de modelos para `forFeature()`/`forFeatureAsync()`. |
| `Model`, `Item`, `Query`, `Scan`, `QueryResponse`, `ScanResponse`, `UpdatePartial`, …        | Tipos      | Tipado de modelos, items y operaciones.                        |
| `Transaction`, `Transactions`, `GetTransaction`, `CreateTransaction`, `UpdateTransaction`, … | Tipos      | Tipado de transacciones.                                       |

### `DynamooseModule`

| Método                                               | Descripción                                                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `DynamooseModule` (sin método)                       | Modo de configuración centralizada. Lee `config.dynamodb` automáticamente vía `ConfigService`. |
| `forRoot(options?: DynamooseModuleOptions)`          | Registra el módulo con opciones estáticas.                                                     |
| `forRootAsync(options: DynamooseModuleAsyncOptions)` | Registra el módulo con opciones asíncronas (`useFactory`, `useClass`, `useExisting`).          |
| `forFeature(models?: ModelDefinition[])`             | Registra modelos de forma síncrona en el contexto del módulo actual.                           |
| `forFeatureAsync(factories?: AsyncModelFactory[])`   | Registra modelos de forma asíncrona, soportando inyección de dependencias en la factory.       |

### `DynamooseModuleOptions`

| Propiedad | Tipo                                          | Descripción                                                                                    |
| --------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `aws`     | `{ accessKeyId?, secretAccessKey?, region? }` | Región y credenciales de AWS (se mapean a `credentials` del AWS SDK v3).                       |
| `local`   | `boolean \| string`                           | Activa el modo local. Si es `true` usa `http://localhost:8000`; también acepta una URL custom. |
| `ddb`     | `DynamoDB`                                    | Instancia de cliente DynamoDB de `@aws-sdk/client-dynamodb`. Tiene precedencia sobre `aws`.    |
| `table`   | `TableOptionsOptional`                        | Opciones globales de tabla (prefix, suffix, create, etc.).                                     |
| `logger`  | `boolean \| LoggerService`                    | Activa el logger de Dynamoose (`true` usa el `Logger` de Nest).                                |

### `DynamooseOptionsFactory` (interfaz)

Interfaz que deben implementar las clases usadas con `useClass` en `forRootAsync()`.

```typescript
interface DynamooseOptionsFactory {
  createDynamooseOptions(): Promise<DynamooseModuleOptions> | DynamooseModuleOptions;
}
```

### `ModelDefinition`

| Propiedad     | Tipo                                                           | Descripción                                                       |
| ------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `name`        | `string`                                                       | Nombre del modelo (también es el nombre de la tabla por defecto). |
| `schema`      | `Schema \| SchemaDefinition \| (Schema \| SchemaDefinition)[]` | Schema de Dynamoose.                                              |
| `options`     | `ModelTableOptions`                                            | Opciones del modelo/tabla (tableName, etc.).                      |
| `serializers` | `{ [key: string]: SerializerOptions }`                         | Serializadores nombrados para el modelo.                          |

### `AsyncModelFactory`

| Propiedad     | Tipo                                                   | Descripción                                                      |
| ------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| `name`        | `string`                                               | Nombre del modelo.                                               |
| `useFactory`  | `(...args) => Schema \| Omit<ModelDefinition, 'name'>` | Función factory que devuelve el schema o la definición completa. |
| `inject`      | `any[]`                                                | Proveedores a inyectar en la factory.                            |
| `imports`     | `any[]`                                                | Módulos a importar en el contexto de este factory.               |
| `options`     | `ModelTableOptions`                                    | Opciones del modelo (pueden sobreescribirse desde la factory).   |
| `serializers` | `{ [key: string]: SerializerOptions }`                 | Serializadores (pueden sobreescribirse desde la factory).        |

### `@InjectModel(model: string)`

Decorador para inyectar un modelo Dynamoose en el constructor. Equivale a `@Inject(getModelToken(model))`.

```typescript
constructor(@InjectModel('User') private userModel: Model<IUser, UserKey>) {}
```

### `getModelToken(model: string): string`

Función utilitaria que retorna el token de inyección para un modelo dado. Útil para testing.

```typescript
import { getModelToken } from '@tresdoce-nestjs-toolkit/dynamoose';

// En un test:
const module = await Test.createTestingModule({
  providers: [
    {
      provide: getModelToken('User'),
      useValue: mockUserModel,
    },
  ],
}).compile();
```

### `TransactionSupport`

Clase abstracta que deben extender los servicios que necesiten usar transacciones de DynamoDB.

```typescript
abstract class TransactionSupport {
  transaction(
    transactions: Transactions,
    settings?: TransactionSettings,
    callback?: CallbackType<any, any>,
  ): any;
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
