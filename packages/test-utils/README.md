<div align="center">
    <img alt="nestjs-logo" width="250" height="auto" src="https://camo.githubusercontent.com/c704e8013883cc3a04c7657e656fe30be5b188145d759a6aaff441658c5ffae0/68747470733a2f2f6e6573746a732e636f6d2f696d672f6c6f676f5f746578742e737667" />
    <h1>Tresdoce NestJs Toolkit<br/>Test-Utils</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Node&message=v14.17.0&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="Node.js"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=Npm&message=v6.14.13&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="Npm"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJs&message=v9.2.1&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJs"/><br/>
    <img alt="GitHub license" src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat">
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/test-utils.svg">
    <br/>
</div>
<br/>

Esta librería está pensada para ser utilizada en [NestJs Starter](https://github.com/rudemex/nestjs-starter) o en este
monorepo de funcionalidades, o cualquier
proyecto que utilice una configuración centralizada, siguiendo la misma arquitectura del starter.

Al momento de realizar nuestros test, puede existir la necesidad de implementar una configuración para el `ConfigModule`
, lo cual a veces se vuelve tedioso tener que estar creando un mock puntual para cada test, generando además duplicidad
de código, como asi también la utilización de algún servicio que requiera nuestro código, como puede ser una Base de
datos para test, y no tener la infraestructura disponible para dichas pruebas.

Por esta razón, y con el fin de desarrollar nuestros test de manera más ágiles y sin preocupaciones, surge la idea de
esta librería que maneja de manera centralizada todo lo necesario para nuestros tests.

## Glosario

- [🥳 Demo](https://nestjs-starter.up.railway.app/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Uso](#use)
- [🧪 TestContainers](#testcontainers)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJs Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v14.17.0 or higher ([Download](https://nodejs.org/es/download/))
- YARN v1.22.17 or higher
- NPM v6.14.13 or higher
- NestJS v9.2.1 or higher ([Documentación](https://nestjs.com/))

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -D @tresdoce-nestjs-toolkit/test-utils
```

```
yarn add -D @tresdoce-nestjs-toolkit/test-utils
```

<a name="use"></a>

## 👨‍💻 Uso

### Base Configuration for test

```typescript
//...
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

describe('Suite for base config', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        //...
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  //...
});
```

### Dynamic Configuration for test

```typescript
//...
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

describe('Suite for dynamic config', () => {
  let app: INestApplication;

  const args = {
    httOptions: {
      timeout: 5000,
      maxRedirects: 5,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [dynamicConfig(args)],
        }),
        //...
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });
  //...
});
```

<a name="testcontainers"></a>

## 🧪 TestContainers

[TestContainers](https://node.testcontainers.org/) es una librería que utiliza docker de por medio para poder instanciar
un servicio durante el entorno de testing, tanto local como asi también en nuestros pipelines, y poder realizar las
pruebas correctamente sin tener que estar consumiendo el servicio de algún entorno.

Esta librería viene con una configuración base para instanciar `Redis`, `MongoDB`, `Postgres`, `MySql` y `Elasticsearch`,
pero también cuenta con la posibilidad de levantar cualquier otro servicio utilizando las imágenes de docker, por lo que se requiere
tener [Docker](https://www.docker.com/) instalado.

### Global Container

Instancia uno o más containers a partir de un archivo `docker-compose.yml`, está funcionalidad es ideal para instanciar
los servicios de una aplicación y que disponible para consumir en todos los test.

Agregar `globalSetup` y `globalTeardown` a la configuración de jest de la aplicación (`jest.config.ts`)

```typescript
//./jest.config.ts
import { jestConfig } from '@tresdoce-nestjs-toolkit/commons';
import * as dotenv from 'dotenv';

process.env.NODE_ENV = 'test';

dotenv.config({
  path: '.env.test',
});

module.exports = {
  ...jestConfig(),
  globalSetup: './jest.globalSetup.ts',
  globalTeardown: './jest.globalTeardown.ts',
};
```

Creamos los archivos `jest.globalSetup.ts` y `jest.globalTeardown.ts` en el root de la aplicación.

```typescript
//./jest.globalSetup.ts
import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

const services = ['mongo', 'redis', 'elasticsearch'];
module.exports = initDockerCompose(services);
```

<details>
<summary>💬 Para ver en detalle todas las propiedades de la configuración, hace clic acá.</summary>

La función `initDockerCompose` recibe tres parámetros.

`services`: Es un array de string que sirve para especificar que servicios se quiere instanciar del `docker-compose.yml`,
si no se envía el parámetro o se envía un array vacío, se inicializa todos los servicios definidos en el archivo.

- Type: `String[]`
- Required: `false`
- Default: `[]`
- Example: `['mongo', 'redis', 'elasticsearch']`

`composeFilePath`: Es el path de donde se encuentra el archivo `docker-compose.yml`.

- Type: `String`
- Required: `false`
- Default: `'.'`

`composeFile`: Es el nombre del archivo de `docker-compose`.

- Type: `String`
- Required: `false`
- Default: `'docker-compose.yml'`

```typescript
//./jest.globalSetup.ts
import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';
import * as path from 'path';

const services = ['mongo', 'redis'];
const composeFilePath = path.resolve(__dirname, 'fixtures', 'docker-compose');
const composeFile = 'docker-compose-test.yml';

module.exports = initDockerCompose(services, composeFilePath, composeFile);
```

</details>

```typescript
//./jest.globalTeardown.ts
import { closeDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

module.exports = closeDockerCompose({ removeVolumes: false });
```

```yaml
# ./docker-compose.yml

version: '3.9'

services:
  mongo:
    image: mongo:5.0
    container_name: local-mongo
    restart: always
    ports:
      - '27017:27017'
    environment:
      TZ: UTC
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: 123456
      MONGO_INITDB_DATABASE: test_db

  redis:
    image: redis:6.2-alpine
    container_name: local-redis
    restart: always
    ports:
      - '6379:6379'
    environment:
      TZ: UTC
      REDIS_PORT: 6379
      REDIS_PASSWORD: 123456
      REDIS_HOST: cache
    command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456']
```

> ⚠️ En caso de fallas al correr en los pipelines, revisar que el `docker-compose.yml` este bien configurado y que el
> host del runner sea el mismo que usa docker. Ej.: http://localhost:6379 o http://docker:6379

### Generic Container

Instancia un container con la imagen del servicio, está pensada para utilizarse para proyectos que
utilizan un solo servicio.

```typescript
//...
import { TCPostgresOptions, testContainers, delay } from '@tresdoce-nestjs-toolkit/test-utils';

jest.setTimeout(70000);
describe('TypeOrm - Postgres', () => {
  let app: INestApplication;
  let container: testContainers;

  // Instanciamos el test container
  beforeAll(async () => {
    // await delay(30000); // delay para inicializar el container
    container = await new testContainers('postgres:13', TCPostgresOptions);
    await container.start();
  });

  // Apagamos el container
  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      //...
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  //...
});
```

La clase `testContainers` requiere de dos parámetros, donde el primero es la imagen de docker junto a su tag, y el
segundo son las configs para ese container.

**Schema:** `new testContainers('<img-docker>:<tag-img-docker>', { config-container })`

Para la configuración del contenedor, tiene disponibles las siguientes opciones.

```
{
  ports: [{
    container: number,
    host: number
  }],
  envs: {
    KEY: value
    //...
  },
  containerName: string,
  startupTimeout: number,
  reuse: boolean
}
```

La clase `testContainers` cuenta con algunas funciones que retorna información del contenedor.

- `getEnvs()` retorna las variables de entorno enviadas al contenedor.
- `getContainer()` retorna el contenedor instanciado.
- `getHost()` retorna el host del contenedor instanciado, esto es util, ya que a veces el contenedor no se hostea en
  **localhost**
- `getName()` retorna el nombre del contenedor.

### Troubleshooting

Para solucionar el problema de `failed: port is already allocated`, es recomendable cambiar el puerto del `host`,
manteniendo el del `container` con el default.

```typescript
// Ejemplo para MongoDB
await new testContainers('mongo:5.0', {
  ...TCMongoOptions,
  ports: [
    {
      container: 27017,
      host: 27013,
    },
  ],
});
```

Limpiar los containers, images y volumes para probar en un entorno desde cero.

```bash
docker system prune --volumes
docker system prune -a
yarn test --force
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
