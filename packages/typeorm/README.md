<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Typeorm</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v20.19.3&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.2.0&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.3&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/tresdoce/tresdoce-nestjs-toolkit?filename=packages%2Ftypeorm%2Fpackage.json">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/typeorm.svg">
    <br/>
</div>
<br/>

Este módulo está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter), o cualquier
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
- Node.js v20.19.3 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.22 or higher
- NPM v11.2.0 or higher
- NestJS v11.1.3 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/typeorm
```

```
yarn add @tresdoce-nestjs-toolkit/typeorm
```

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a la base de datos en `configuration.ts` utilizando el key `database` que contenga el
objeto `typeorm` y asigne los datos desde las variables de entorno.

Estos datos pueden variar dependiendo si te vas a conectar a una `MongoDB`, `Postgres` o `MySql`, por lo que es
recomendable revisar la [Documentación de NestJS](https://docs.nestjs.com/techniques/database) como también
la [Documentación de TypeORM](https://typeorm.io/) y
el [Data Source Options](https://typeorm.io/data-source-options#common-data-source-options) de TypeORM.

```typescript
//./src/config/configuration.ts
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    database: {
      typeorm: {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10),
        username: encodeURIComponent(process.env.DATABASE_USERNAME),
        password: encodeURIComponent(process.env.DATABASE_PASSWORD),
        database: encodeURIComponent(process.env.DATABASE_DB_NAME),
        synchronize: false,
        autoLoadEntities: false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      },
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`type`: Es el tipo de base de datos a conectarse.

- Type: `String`
- Values: `mongodb | postgres | mysql | <otra>`

`host`: Es el servidor para conectarse a la base de datos mongo.

- Type: `String`
- Values: `localhost | 127.0.0.1 | <host>`

`port`: Es el puerto para conectarse a la base de datos mongo, no es obligatorio ponerlo.

- Type: `Number`

`username`: Es el nombre de usuario para conectarse a la base de datos.

- Type: `String`

`password`: Es la contraseña de usuario para conectarse a la base de datos.

- Type: `String`

`database`: Es el nombre de la base de datos.

- Type: `String`

`synchronize`: Indica si el esquema de la base de datos debe ser creado automáticamente en cada lanzamiento de la
aplicación. Tenga cuidado con esta opción y no la utilice en producción - de lo contrario puede perder los datos de
producción.

- Type: `Boolean`

`autoLoadEntities`: Carga automática de las entities.

- Type: `Boolean`
- Default: `false`

`entities`: Es un array de strings para configurar los entities a utilizar, se puede poner un glob para que reconozca a
todas las entidades.

- Type: `Array`

</details>

<a name="use"></a>

## 👨‍💻 Uso

Importar el `TypeOrmClientModule` en el archivo `app.module.ts`, y el módulo se encargará de obtener la configuración
y realizar la connexion automáticamente.

```typescript
//./src/app.module.ts
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';

@Module({
  //...
  imports: [
    //...
    TypeOrmClientModule,
    //...
  ],
  //...
})
export class AppModule {}
```

Para la inyección de `Schemas` se utiliza la propiedad `forFeature` del módulo enviando las `entity` como un array.

```typescript
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';
import { Cat } from './entities/cat.entity';

@module({
  imports: [
    //...
    TypeOrmClientModule.forFeature([Cat]),
    //...
  ],
  //...
})
export class CatsModule {}
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
