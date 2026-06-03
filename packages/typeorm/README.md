<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>TypeORM</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/tresdoce/tresdoce-nestjs-toolkit?filename=packages%2Ftypeorm%2Fpackage.json">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/typeorm.svg">
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

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/typeorm
```

```
yarn add @tresdoce-nestjs-toolkit/typeorm
```

Las dependencias `typeorm` y `@nestjs/typeorm` están incluidas como dependencias del paquete.
El driver de base de datos correspondiente (pg, mysql2, mongodb, etc.) se incluye igualmente.

<a name="internal-dependencies"></a>

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="configurations"></a>

## ⚙️ Configuración

Agregar los datos de conexión a la base de datos en `configuration.ts` utilizando el key `database` que contenga el
objeto `typeorm` con los datos de conexión desde las variables de entorno.

Los parámetros varían según el motor de base de datos (`MongoDB`, `Postgres`, `MySQL`, etc.).
Se recomienda revisar la [Documentación de NestJS](https://docs.nestjs.com/techniques/database),
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
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      },
    },
    //...
  };
});
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

`type`: Tipo de base de datos a conectarse.

- Type: `String`
- Values: `mongodb | postgres | mysql | mariadb | sqlite | mssql | <otra>`

`host`: Servidor para conectarse a la base de datos.

- Type: `String`
- Values: `localhost | 127.0.0.1 | <host>`

`port`: Puerto para conectarse a la base de datos.

- Type: `Number`

`username`: Nombre de usuario para conectarse a la base de datos.

- Type: `String`

`password`: Contraseña de usuario para conectarse a la base de datos.

- Type: `String`

`database`: Nombre de la base de datos.

- Type: `String`

`synchronize`: Indica si el esquema de la base de datos debe ser creado automáticamente en cada lanzamiento de la
aplicación. **No usar en producción** — puede generar pérdida de datos.

- Type: `Boolean`
- Default: `false`

`autoLoadEntities`: Carga automática de las entidades registradas con `TypeOrmClientModule.forFeature()`.
Se recomienda usar `true` cuando se usa el patrón `forFeature`.

- Type: `Boolean`
- Default: `false`

`entities`: Array de rutas o clases de entidades. Se puede usar un glob para reconocer automáticamente todas las entidades.

- Type: `Array`
- Example: `[__dirname + '/**/*.entity{.ts,.js}']`

</details>

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo (configuración centralizada)

Importar el `TypeOrmClientModule` en el archivo `app.module.ts`. El módulo es `@Global()` y obtiene la configuración
automáticamente desde `ConfigService` (key `config.database.typeorm`).

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

### Registro de entidades con `forFeature`

Para registrar entidades en un módulo de feature, utilizar `TypeOrmClientModule.forFeature()`.
Se deben pasar las clases de entidad como array.

Cuando se usa `forFeature`, se recomienda usar `autoLoadEntities: true` en la configuración para que
TypeORM las registre automáticamente en la conexión.

```typescript
//./src/cats/cats.module.ts
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';
import { Cat } from './entities/cat.entity';

@Module({
  imports: [TypeOrmClientModule.forFeature([Cat])],
  //...
})
export class CatsModule {}
```

### Uso de repositorios

Una vez registrada la entidad, se puede inyectar su repositorio:

```typescript
//./src/cats/cats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@tresdoce-nestjs-toolkit/typeorm';
import { Repository } from '@tresdoce-nestjs-toolkit/typeorm';
import { Cat } from './entities/cat.entity';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.catRepository.find();
  }
}
```

### Definición de entidad

Los decoradores de TypeORM pueden importarse directamente desde este paquete:

```typescript
//./src/cats/entities/cat.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from '@tresdoce-nestjs-toolkit/typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;
}
```

<a name="api-reference"></a>

## 📖 API Reference

### `TypeOrmClientModule`

Módulo global (`@Global()`). Configura y exporta `TypeOrmModule` y el token `TYPE_ORM_MODULE_OPTIONS`.

| Método                                                            | Descripción                                                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `TypeOrmClientModule` (sin argumentos)                            | Carga la configuración desde `ConfigService` (key `config.database.typeorm`).         |
| `TypeOrmClientModule.forFeature(entities: EntityClassOrSchema[])` | Registra entidades para el módulo de feature. Delega en `TypeOrmModule.forFeature()`. |

### `DatabaseOptions`

Interfaz que representa la sección `database` de la configuración de la aplicación.

| Campo     | Tipo                   | Descripción                                                           |
| --------- | ---------------------- | --------------------------------------------------------------------- |
| `typeorm` | `TypeOrmModuleOptions` | Opciones de conexión TypeORM (ver documentación de `@nestjs/typeorm`) |

### Constantes exportadas

| Constante                 | Valor                       | Descripción                                                                                        |
| ------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `TYPE_ORM_MODULE_OPTIONS` | `'TYPE_ORM_MODULE_OPTIONS'` | Token de inyección de las opciones del módulo. Puede inyectarse para leer la configuración activa. |

### Re-exportaciones

Este paquete re-exporta completamente los siguientes módulos, por lo que todos sus tipos, decoradores e interfaces
pueden importarse directamente desde `@tresdoce-nestjs-toolkit/typeorm`:

| Módulo re-exportado               | Ejemplos de exports disponibles                                          |
| --------------------------------- | ------------------------------------------------------------------------ |
| `typeorm`                         | `Entity`, `Column`, `Repository`, `DataSource`, `FindOptionsWhere`, etc. |
| `@nestjs/typeorm/dist/common`     | `InjectRepository`, `InjectDataSource`, etc.                             |
| `@nestjs/typeorm/dist/interfaces` | `TypeOrmModuleOptions`, `TypeOrmOptionsFactory`, etc.                    |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
