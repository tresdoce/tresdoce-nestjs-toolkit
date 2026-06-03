<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Dynamoose</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/dynamoose.svg">
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
- [📚 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.21.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v11.1.11 or higher ([Documentación](https://nestjs.com/))
- Cliente Local AWS DynamoDB ([Download](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.install.html))

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

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a DynamoDB en `configuration.ts` utilizando el key `dynamodb` y que contenga el
objeto con los datos de conexión desde las variables de entorno.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';
import * as PACKAGE_JSON from '../../package.json';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    dynamodb: {
      local: process.env.NODE_ENV !== 'production' || false,
      logger: process.env.NODE_ENV !== 'production' || false,
      aws: {
        accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
        region: `${process.env.AWS_REGION}`,
      },
      table: {
        create: process.env.NODE_ENV !== 'production' || false,
        prefix: `${PACKAGE_JSON.name}-`,
        suffix: '-table',
      },
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`local`: Habilita el uso de DynamoDB de manera local.

- Type: `Boolean | String`
- Default: `false`
- Values: `true | false | http://docker:8000 | http://localhost:8000`

`logger`: Habilita los logs utilizando como provider a `dynamoose-logger`.

- Type: `Boolean`
- Default: `false`

`ddb`: Instancia de cliente DynamoDB (`@aws-sdk/client-dynamodb`) para usarla directamente. Cuando se proporciona, tiene precedencia sobre la configuración de `aws`.

- Type: `DynamoDB` (de `@aws-sdk/client-dynamodb`)

#### AWS

Para los datos de **AWS** es sumamente importante utilizar los siguientes nombres de variables de entorno: `AWS_ACCESS_KEY_ID` `AWS_SECRET_ACCESS_KEY` `AWS_REGION`

`accessKeyId`: Es el Access Key ID de aws.

- Type: `String`
- Default: `local`

`secretAccessKey`: Es el Secret Access Key de aws.

- Type: `String`
- Default: `local`

`region`: Es la region de la cuenta de aws.

- Type: `String`
- Default: `us-east-1`

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
import { DynamooseModule } from '@tresdoce-nestjs-toolkit/dynamoose';

@Module({
  //...
  imports: [
    //...
    DynamooseModule,
    //...
  ],
  //...
})
export class AppModule {}
```

### Registro manual con `forRoot()`

Cuando necesites pasar las opciones de manera estática, sin usar la configuración centralizada:

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
import {
  DynamooseModule,
  DynamooseOptionsFactory,
  DynamooseModuleOptions,
} from '@tresdoce-nestjs-toolkit/dynamoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

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

import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserSchema } from './models/user.schema';

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
          public: { exclude: ['sensitiveField'] },
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
import { InjectModel, Model } from '@tresdoce-nestjs-toolkit/dynamoose';

import { UserKey, User as IUser } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<IUser, UserKey>) {}

  async create(user: IUser): Promise<any> {
    return await this.userModel.create(user);
  }

  async update(key: UserKey, user: Partial<IUser>): Promise<any> {
    return await this.userModel.update(key, user);
  }

  async findOne(key: UserKey): Promise<any> {
    return await this.userModel.get(key);
  }

  async findAll(): Promise<any> {
    return await this.userModel.scan().exec();
  }
}
```

### Transaction

Para usar transacciones, el servicio debe extender `TransactionSupport`:

```typescript
//./src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from '@tresdoce-nestjs-toolkit/dynamoose';

import { UserKey, User as IUser } from '../interfaces/user.interface';

@Injectable()
export class UsersService extends TransactionSupport {
  constructor(@InjectModel('User') private userModel: Model<IUser, UserKey>) {
    super();
  }

  async createInTransaction(user: IUser): Promise<any> {
    return await this.transaction([this.userModel.transaction.create(user)]);
  }
}
```

> 💬 Este módulo usa como dependencia inyectada a [Dynamoose](https://dynamoosejs.com/getting_started/Introduction), para
> obtener más información sobre su uso podés consultar su documentación.

<a name="api-reference"></a>

## 📚 API Reference

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
| `aws`     | `{ accessKeyId?, secretAccessKey?, region? }` | Credenciales de AWS.                                                                           |
| `local`   | `boolean \| string`                           | Activa el modo local. Si es `true` usa `http://localhost:8000`; también acepta una URL custom. |
| `ddb`     | `DynamoDB`                                    | Instancia de cliente DynamoDB de `@aws-sdk/client-dynamodb`. Tiene precedencia sobre `aws`.    |
| `table`   | `TableOptionsOptional`                        | Opciones globales de tabla (prefix, suffix, create, etc.).                                     |
| `logger`  | `boolean \| LoggerService`                    | Activa el logger de Dynamoose.                                                                 |

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
