<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>TypeORM</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
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
- [🐳 Base de datos local con Docker](#docker)
- [👨‍💻 Uso](#use)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

## ¿Qué hace este paquete?

`@tresdoce-nestjs-toolkit/typeorm` es un wrapper de [`@nestjs/typeorm`](https://docs.nestjs.com/techniques/database)
que conecta [TypeORM](https://typeorm.io/) a tu aplicación leyendo la configuración centralizada del starter
(`config.database.typeorm`), sin tener que escribir el `TypeOrmModule.forRootAsync(...)` en cada proyecto.

Usalo cuando tu aplicación necesite una base de datos relacional (PostgreSQL, MySQL/MariaDB, SQL Server, SQLite, etc.)
o MongoDB a través de TypeORM, y quieras que la conexión se configure desde `configuration.ts` y variables de entorno.

Además, re-exporta completos `typeorm` y `@nestjs/typeorm`, por lo que entidades, decoradores, repositorios y
`InjectRepository` se pueden importar desde un único paquete.

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- Proyecto ESM (`"type": "module"`): el paquete se publica únicamente como ES Module.

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -S @tresdoce-nestjs-toolkit/typeorm
```

```
yarn add @tresdoce-nestjs-toolkit/typeorm
```

El paquete incluye como dependencias `typeorm` (1.x), `@nestjs/typeorm` (12.x), `@nestjs/config` y los drivers
`pg` (PostgreSQL), `mysql2` (MySQL/MariaDB) y `mongodb` (MongoDB). Para otros motores (`mssql`, `better-sqlite3`,
`oracledb`, etc.) instalá el driver correspondiente en tu proyecto.

> [!NOTE]
> TypeORM 1.x usa exclusivamente `mysql2` para MySQL/MariaDB: el paquete `mysql` ya no está soportado.

<a name="internal-dependencies"></a>

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente, siempre que la
aplicación registre la configuración con `registerAs('config', ...)` y `ConfigModule` global.

<a name="configurations"></a>

## ⚙️ Configuración

El módulo lee las opciones de conexión desde `ConfigService` con la key **`config.database.typeorm`**
(`Typings.AppConfig['database']`, tipado como `DatabaseOptions`). El objeto es un
[`TypeOrmModuleOptions`](https://docs.nestjs.com/techniques/database) y se pasa tal cual a `TypeOrmModule.forRootAsync`.

Los parámetros varían según el motor (`postgres`, `mysql`, `mongodb`, etc.). Revisá la
[Documentación de NestJS](https://docs.nestjs.com/techniques/database) y las
[Data Source Options](https://typeorm.io/docs/data-source/data-source-options) de TypeORM.

```typescript
//./src/config/configuration.ts
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    //...
    database: {
      typeorm: {
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT, 10),
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DB_NAME,
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
        autoLoadEntities: true,
      },
    },
    //...
  };
});
```

```dotenv
# .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=root
DATABASE_PASSWORD=123456
DATABASE_DB_NAME=test_db
DATABASE_SYNCHRONIZE=false
```

Las variables de entorno son una convención del starter: el módulo no las lee directamente, solo lee
`config.database.typeorm`.

<details>
<summary>💬 Ejemplos para MySQL y MongoDB</summary>

```typescript
// MySQL / MariaDB (driver mysql2)
database: {
  typeorm: {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10), // 3306
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB_NAME,
    autoLoadEntities: true,
  },
},
```

```typescript
// MongoDB (driver mongodb)
database: {
  typeorm: {
    type: 'mongodb',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10), // 27017
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB_NAME,
    authSource: 'admin',
    autoLoadEntities: true,
  },
},
```

</details>

<details>
<summary>💬 Para ver en detalle las propiedades más usadas de la configuración, hace clic acá.</summary>

`type`: Tipo de base de datos a conectarse.

- Type: `String`
- Values: `postgres | mysql | mariadb | mongodb | mssql | better-sqlite3 | <otra>`

`host`: Servidor para conectarse a la base de datos.

- Type: `String`
- Values: `localhost | 127.0.0.1 | <host>`

`port`: Puerto para conectarse a la base de datos.

- Type: `Number`

`username` / `password`: Credenciales de conexión. Se pasan tal cual al driver: no uses `encodeURIComponent` salvo
que armes una `url` de conexión.

- Type: `String`

`database`: Nombre de la base de datos.

- Type: `String`

`url`: URL de conexión completa (alternativa a `host`/`port`/`username`/`password`/`database`).

- Type: `String`
- Example: `postgres://root:123456@localhost:5432/test_db`

`synchronize`: Crea/actualiza el esquema automáticamente en cada arranque. **No usar en producción** — puede
generar pérdida de datos.

- Type: `Boolean`
- Default: `false`

`autoLoadEntities`: Registra automáticamente en la conexión las entidades declaradas con
`TypeOrmClientModule.forFeature()`. Recomendado en `true`.

- Type: `Boolean`
- Default: `false`

`entities`: Array de clases de entidades o globs. En ESM usá `import.meta.dirname` (no existe `__dirname`).

- Type: `Array`
- Example: `[import.meta.dirname + '/../**/*.entity.js']`

`retryAttempts` / `retryDelay`: Reintentos de conexión al iniciar (propios de `@nestjs/typeorm`).

- Type: `Number`
- Default: `10` / `3000` (ms)

</details>

<a name="docker"></a>

## 🐳 Base de datos local con Docker

Para desarrollo local podés levantar PostgreSQL y/o MySQL con el siguiente `docker-compose.yml`:

```yaml
# ./docker-compose.yml
services:
  postgres:
    image: postgres:15
    container_name: postgres
    restart: always
    ports:
      - '5432:5432'
    environment:
      TZ: 'America/Argentina/Buenos_Aires'
      POSTGRES_DB: test_db
      POSTGRES_USER: root
      POSTGRES_PASSWORD: 123456

  mysql:
    image: mysql:8.4
    container_name: mysql
    restart: always
    ports:
      - '3306:3306'
    environment:
      TZ: 'America/Argentina/Buenos_Aires'
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: test_db
```

```bash
docker compose up -d postgres   # o: docker compose up -d mysql
```

Con PostgreSQL usá `DATABASE_PORT=5432` y `type: 'postgres'`; con MySQL, `DATABASE_PORT=3306`, `type: 'mysql'` y
usuario `root`.

<a name="use"></a>

## 👨‍💻 Uso

### Importación del módulo

Importá `TypeOrmClientModule` una sola vez en `app.module.ts`. El módulo es `@Global()` y obtiene la configuración
desde `ConfigService` (key `config.database.typeorm`), por lo que `ConfigModule` tiene que estar registrado como global.

```typescript
//./src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';

import configuration from './config/configuration.js';
import { CatsModule } from './cats/cats.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmClientModule,
    CatsModule,
  ],
})
export class AppModule {}
```

Al iniciar, `@nestjs/typeorm` loguea la conexión:

```
[Nest] 12345  - 26/10/2026, 10:00:00     LOG [InstanceLoader] TypeOrmClientModule dependencies initialized +1ms
[Nest] 12345  - 26/10/2026, 10:00:00     LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized +35ms
```

Si la base no está disponible, reintenta según `retryAttempts`/`retryDelay`:

```
[Nest] 12345  - 26/10/2026, 10:00:00   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
```

### Definición de entidad

Los decoradores de TypeORM se pueden importar directamente desde este paquete:

```typescript
//./src/cats/entities/cat.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from '@tresdoce-nestjs-toolkit/typeorm';

@Entity()
export class Cat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Registro de entidades con `forFeature`

Para usar los repositorios en un módulo de feature, registrá las entidades con `TypeOrmClientModule.forFeature()`.
Con `autoLoadEntities: true` no hace falta listarlas en `entities`.

```typescript
//./src/cats/cats.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmClientModule } from '@tresdoce-nestjs-toolkit/typeorm';

import { Cat } from './entities/cat.entity.js';
import { CatsController } from './cats.controller.js';
import { CatsService } from './cats.service.js';

@Module({
  imports: [TypeOrmClientModule.forFeature([Cat])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}
```

### Uso de repositorios

```typescript
//./src/cats/cats.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, Repository } from '@tresdoce-nestjs-toolkit/typeorm';

import { Cat } from './entities/cat.entity.js';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(Cat)
    private readonly catRepository: Repository<Cat>,
  ) {}

  async findAll(): Promise<Cat[]> {
    return this.catRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Cat> {
    const cat = await this.catRepository.findOneBy({ id });
    if (!cat) throw new NotFoundException(`Cat ${id} not found`);
    return cat;
  }

  async create(data: Pick<Cat, 'name' | 'age'>): Promise<Cat> {
    return this.catRepository.save(this.catRepository.create(data));
  }
}
```

```typescript
//./src/cats/cats.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';

import { CatsService } from './cats.service.js';

@Controller('cats')
export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  @Get()
  findAll() {
    return this.catsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.catsService.findOne(id);
  }

  @Post()
  create(@Body() body: { name: string; age: number }) {
    return this.catsService.create(body);
  }
}
```

Respuesta de `POST /cats` con body `{ "name": "Michi", "age": 3 }`:

```json
{
  "name": "Michi",
  "age": 3,
  "id": 1,
  "createdAt": "2026-10-26T13:00:00.000Z"
}
```

Respuesta de `GET /cats`:

```json
[
  { "id": 1, "name": "Michi", "age": 3, "createdAt": "2026-10-26T13:00:00.000Z" },
  { "id": 2, "name": "Garfield", "age": 7, "createdAt": "2026-10-26T13:05:00.000Z" }
]
```

### Uso del `DataSource` y transacciones

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource } from '@tresdoce-nestjs-toolkit/typeorm';

import { Cat } from './entities/cat.entity.js';

@Injectable()
export class AdoptionService {
  constructor(private readonly dataSource: DataSource) {}

  async adoptAll(names: string[]): Promise<Cat[]> {
    return this.dataSource.transaction((manager) =>
      Promise.all(names.map((name) => manager.save(manager.create(Cat, { name, age: 0 })))),
    );
  }
}
```

### Leer la configuración activa

El token `TYPE_ORM_MODULE_OPTIONS` expone las opciones resueltas desde `config.database.typeorm`:

```typescript
import { Inject, Injectable } from '@nestjs/common';
import {
  TYPE_ORM_MODULE_OPTIONS,
  type TypeOrmModuleOptions,
} from '@tresdoce-nestjs-toolkit/typeorm';

@Injectable()
export class DbInfoService {
  constructor(@Inject(TYPE_ORM_MODULE_OPTIONS) private readonly options: TypeOrmModuleOptions) {}

  get engine(): string {
    return this.options.type; // 'postgres'
  }
}
```

### Tests

En tests unitarios podés reemplazar el repositorio con `getRepositoryToken`:

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@tresdoce-nestjs-toolkit/typeorm';

import { Cat } from './entities/cat.entity.js';
import { CatsService } from './cats.service.js';

const moduleRef = await Test.createTestingModule({
  providers: [
    CatsService,
    { provide: getRepositoryToken(Cat), useValue: { find: vi.fn().mockResolvedValue([]) } },
  ],
}).compile();
```

<a name="api-reference"></a>

## 📖 API Reference

### `TypeOrmClientModule`

Módulo global (`@Global()`). Importa `ConfigModule`, registra `TypeOrmModule.forRootAsync` con las opciones de
`config.database.typeorm` y exporta `TypeOrmModule` y el token `TYPE_ORM_MODULE_OPTIONS`.

| Método                                                   | Descripción                                                                                                                                                             |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TypeOrmClientModule`                                    | Importación directa (sin `register`). Lee la configuración desde `ConfigService`.                                                                                       |
| `TypeOrmClientModule.forFeature(entities?, dataSource?)` | Registra los repositorios de las entidades en el módulo. Delega en `TypeOrmModule.forFeature()`. `dataSource` es opcional (nombre, `DataSource` o `DataSourceOptions`). |

### `DatabaseOptions`

Tipo de la key `database` de `Typings.AppConfig`.

| Campo      | Tipo                   | Descripción                                                         |
| ---------- | ---------------------- | ------------------------------------------------------------------- |
| `typeorm?` | `TypeOrmModuleOptions` | Opciones de conexión TypeORM, pasadas tal cual a `@nestjs/typeorm`. |

### Constantes exportadas

| Constante                 | Valor                       | Descripción                                                                 |
| ------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `TYPE_ORM_MODULE_OPTIONS` | `'TYPE_ORM_MODULE_OPTIONS'` | Token de inyección con las opciones resueltas de `config.database.typeorm`. |

### Re-exportaciones

El paquete hace `export *` de `typeorm` y `@nestjs/typeorm`, así que todo lo que exportan se puede importar desde
`@tresdoce-nestjs-toolkit/typeorm`. No hay nombres en conflicto entre ambos (verificado en runtime con Node ESM).

| Módulo re-exportado | Ejemplos de exports disponibles                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typeorm`           | `Entity`, `Column`, `PrimaryGeneratedColumn`, `Repository`, `DataSource`, `EntityManager`, `In`, `Like`, `FindOptionsWhere`, etc.                        |
| `@nestjs/typeorm`   | `TypeOrmModule`, `InjectRepository`, `InjectDataSource`, `InjectEntityManager`, `getRepositoryToken`, `getDataSourceToken`, `TypeOrmModuleOptions`, etc. |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
