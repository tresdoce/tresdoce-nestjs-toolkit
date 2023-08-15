<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJS Toolkit<br/>Dynamoose</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v18.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v9.6.7&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v10.1.3&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/dynamoose.svg">
    <br/>
</div>
<br/>

Este módulo está pensado para ser utilizado en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

## Glosario

- [🥳 Demo](https://nestjs-starter.up.railway.app/v1/docs)
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
- Node.js v18.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.18 or higher
- NPM v9.6.7 or higher
- NestJS v10.1.3 or higher ([Documentación](https://nestjs.com/))
- Cliente Local AWS DynamoDB ([Download](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.settingup.install.html))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/dynamoose
```

```
yarn add @tresdoce-nestjs-toolkit/dynamoose
```

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a DynamoDB en `configuration.ts` utilizando el key `dynamodb` y que contenga el
objeto con los datos conexión desde las variables de entorno.

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

Importar el `DynamooseModule` en el archivo `app.module.ts`, y el módulo se encargará de obtener la configuración e
instanciar la conexión.

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

#### Crear el Schema

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

#### Crear el interface del Model

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

UserKey contiene la `hashKey/partitionKey` y (opcionalmente) la `rangeKey/sortKey`. User contiene todos los atributos del
`document/item`. Al crear estas dos interfaces y usarlas al inyectar tu modelo tendrás typechecking al usar operaciones
como `Model.update()`.

#### Inyectar los Schemas al módulo

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
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

#### Inyectar y usar los Models el módulo

```typescript
//./src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, Model } from '@tresdoce-nestjs-toolkit/dynamoose';

import { UserKey, User as IUser } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<IUser, UserKey>) {}

  async create(user: User): Promise<any> {
    return await this.userModel.create(user);
  }

  async update(key: UserKey, user: Partial<User>): Promise<any> {
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

```typescript
//./src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel, Model, TransactionSupport } from '@tresdoce-nestjs-toolkit/dynamoose';

import { UserKey, User as IUser } from '../interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel: Model<IUser, UserKey>) {
    super();
  }

  async create(user: User): Promise<any> {
    await this.transaction([
      this.userModel.transaction.create(user);
    ]);
  }
}
```

> 💬 Este módulo usa como dependencia inyectada a [Dynamoose](https://dynamoosejs.com/getting_started/Introduction), para
> obtener más información sobre su uso podés consultar su documentación.

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
