<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Test-Utils</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.22%2B&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v12&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
    <img src="https://img.shields.io/github/license/tresdoce/tresdoce-nestjs-toolkit?style=flat" alt="GitHub license" >
    <img alt="Release" src="https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/test-utils.svg">
    <br/>
</div>
<br/>

Esta librería está pensada para ser utilizada en [NestJS Starter](https://github.com/rudemex/nestjs-starter) o en este
monorepo de funcionalidades, o cualquier proyecto que utilice una configuración centralizada, siguiendo la misma
arquitectura del starter.

Al momento de realizar los tests, puede existir la necesidad de implementar una configuración para el `ConfigModule`,
lo cual a veces se vuelve tedioso tener que estar creando un mock puntual para cada test, generando además duplicidad
de código, como también la utilización de algún servicio que requiera el código, como puede ser una base de datos para
tests, sin tener la infraestructura disponible para dichas pruebas.

Por esta razón, y con el fin de desarrollar los tests de manera más ágil y sin preocupaciones, surge la idea de esta
librería que maneja de manera centralizada todo lo necesario para los tests.

## Glosario

- [🥳 Demo](https://nestjs-starter.tresdoce.com.ar/v1/docs)
- [📝 Requerimientos básicos](#basic-requirements)
- [🛠️ Instalar dependencia](#install-dependencies)
- [👨‍💻 Configuración base y dinámica](#use)
- [🎭 VitestFN — mocks de Vitest](#vitestfn)
- [😝 CreateMock](#create-mock)
- [🧪 TestContainers](#testcontainers)
- [📦 Fixtures](#fixtures)
- [📖 API Reference](#api-reference)
- [📄 Changelog](./CHANGELOG.md)
- [📜 License MIT](./license.md)

---

<a name="basic-requirements"></a>

## 📝 Requerimientos básicos

- [NestJS Starter](https://github.com/rudemex/nestjs-starter)
- Node.js v22.22 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v12 or higher ([Documentación](https://nestjs.com/))
- [Docker](https://www.docker.com/) instalado (requerido para TestContainers)

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -D @tresdoce-nestjs-toolkit/test-utils
```

```
yarn add -D @tresdoce-nestjs-toolkit/test-utils
```

## 📦 Dependencias

Este paquete no tiene dependencias internas del toolkit en runtime (solo usa los tipos de
`Typings.AppConfig` de `@tresdoce-nestjs-toolkit/core`). Incluye `@nestjs/config`, `nock`, `testcontainers` y `lodash`
como dependencias, y requiere `vitest` (≥ 5) como **peer dependency**, ya que los mocks de `VitestFN` usan `vi.fn()`.

| Export                                          | Para qué sirve                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `config` / `dynamicConfig`                      | Registrar la key `'config'` (`Typings.AppConfig`) en el `ConfigModule` de un test. |
| `appConfigBase`, `manifest`, `fixture*Response` | Datos de ejemplo para tests.                                                       |
| `VitestFN` (`JestFN` deprecado)                 | Mocks listos de `ConfigService#get` y `ExecutionContext`.                          |
| `createMock` / `cleanAllMock`                   | Mockear peticiones HTTP salientes con nock.                                        |
| `testContainers`, `TC*Options`                  | Levantar un container Docker por suite.                                            |
| `initDockerCompose` / `closeDockerCompose`      | Levantar un `docker-compose.yml` en el `globalSetup` de Vitest.                    |
| `delay` / `pathJoin`                            | Utilidades varias.                                                                 |

<a name="use"></a>

## 👨‍💻 Configuración base y dinámica

### Configuración base para tests

Todos los módulos del toolkit leen su configuración de la key `'config'` del `ConfigService`, con la forma de
`Typings.AppConfig`. `config` es exactamente eso: un `registerAs('config', ...)` que devuelve `appConfigBase`.

```typescript
// Implementación interna (simplificada)
import { registerAs } from '@nestjs/config';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';

export default registerAs('config', (): Typings.AppConfig => appConfigBase);
```

```typescript
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
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

### Configuración dinámica para tests

La función `dynamicConfig` permite sobreescribir propiedades específicas de `appConfigBase` usando un merge profundo
(`_.mergeWith` sobre un `cloneDeep` de la base), sin reemplazar ni mutar la configuración base. Es la forma de activar
módulos opcionales del toolkit (`redis`, `database`, `httpClient`, `elasticsearch`, etc.) dentro de un test.

> Los arrays se fusionan por índice (comportamiento de lodash): `server.origins: ['a']` reemplaza solo la primera posición.

```typescript
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

describe('Suite for dynamic config', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              server: { port: 3000 },
              redis: {
                host: 'localhost',
                port: 6379,
                password: '123456',
              },
            }),
          ],
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

Resultado de `configService.get('config')` en el ejemplo anterior:

```json
{
  "project": {
    "apiPrefix": "API-TEST",
    "name": "nestjs-starter-test",
    "version": "0.0.1",
    "...": "..."
  },
  "server": { "isProd": false, "appStage": "test", "port": 3000, "context": "api", "...": "..." },
  "swagger": { "path": "docs", "enabled": false },
  "params": { "testEnv": "testKeyEnv-test" },
  "redact": {},
  "services": {
    "nestJsDocs": { "url": "https://docs.nestjs.com" },
    "rickAndMortyAPI": { "...": "..." }
  },
  "redis": { "host": "localhost", "port": 6379, "password": "123456" }
}
```

<a name="vitestfn"></a>

## 🎭 VitestFN — mocks de Vitest

El namespace `VitestFN` contiene funciones de mock listas para usar en los tests. Se importa como namespace:

```typescript
import { VitestFN } from '@tresdoce-nestjs-toolkit/test-utils';
```

> `JestFN` sigue exportándose como alias obsoleto de `VitestFN`, para migrar de a poco. Los mocks ahora usan `vi.fn()`, así que `vitest` es peer dependency de este paquete.

### `VitestFN.config()`

Retorna un mock de función que, al ser llamada, devuelve `appConfigBase`. Útil para mockear la función de
configuración en tests unitarios.

```typescript
import { VitestFN } from '@tresdoce-nestjs-toolkit/test-utils';

vi.mock('@nestjs/config', () => ({
  // Los mocks que se instancian con `new` necesitan una function, no una arrow function.
  ConfigService: vi.fn(function () {
    return { get: VitestFN.config() };
  }),
}));
```

### `VitestFN.executionContext()`

Retorna un mock del `ExecutionContext` de NestJS con todos sus métodos (`switchToHttp`, `getRequest`,
`getResponse`, `getType`, `getClass`, `getHandler`) mockeados con `vi.fn().mockReturnThis()`.

```typescript
import { VitestFN } from '@tresdoce-nestjs-toolkit/test-utils';

describe('MyInterceptor', () => {
  it('should call next', () => {
    const context = VitestFN.executionContext();
    // context.switchToHttp() está disponible como mock
  });
});
```

<a name="create-mock"></a>

## 😝 CreateMock

`createMock` es una función que facilita la creación de mocks para peticiones HTTP utilizando **Nock** como base.
`cleanAllMock` limpia todos los interceptores nock registrados. Intercepta cualquier cliente que use el módulo `http`
de Node (axios, `HttpClientService` del toolkit, etc.) y retorna el `Interceptor` de nock creado.

```typescript
import { createMock, cleanAllMock } from '@tresdoce-nestjs-toolkit/test-utils';

describe('MyController', () => {
  beforeEach(async () => {
    cleanAllMock();
  });

  it('should return user data from mock', async () => {
    createMock({
      url: 'https://test.com/api/user/1',
      method: 'get',
      statusCode: 200,
      responseBody: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
      },
    });
    const user = await controller.getUser();
    expect(user).toHaveProperty('firstName', 'John');
  });
});
```

### Tipos de `responseBody`

#### JSON

```typescript
createMock({
  url: 'http://example.com/api/data',
  method: 'get',
  statusCode: 200,
  responseBody: { success: true },
});
```

#### String

```typescript
createMock({
  url: 'http://example.com/api/message',
  method: 'get',
  statusCode: 200,
  responseBody: 'Success message',
});
```

#### Buffer

```typescript
createMock({
  url: 'http://example.com/api/file',
  method: 'get',
  statusCode: 200,
  responseBody: Buffer.from('Some binary data'),
});
```

#### Función (lazy evaluation)

```typescript
createMock({
  url: 'http://example.com/api/dynamicData',
  method: 'get',
  statusCode: 200,
  responseBody: () =>
    JSON.parse(
      fs.readFileSync(path.resolve(import.meta.dirname, '../path/to/fixture.json'), 'utf8'),
    ),
});
```

### Query params

Los query params se pueden indicar con `queryParams` o directamente en la `url`. Si se pasan ambos, gana
`queryParams`.

```typescript
createMock({
  url: 'https://rickandmortyapi.com/api/character?page=2',
  method: 'get',
  statusCode: 200,
  responseBody: { info: { count: 826, pages: 42 }, results: [] },
});

// Equivalente
createMock({
  url: 'https://rickandmortyapi.com/api/character',
  method: 'get',
  statusCode: 200,
  responseBody: { info: { count: 826, pages: 42 }, results: [] },
  queryParams: { page: 2 },
});
```

### Request body y headers

En `post`, `put` y `patch` se puede indicar el body esperado (`reqBody`). Si es un objeto se compara contra su
`JSON.stringify` (el orden de las keys importa).

```typescript
createMock({
  url: 'https://test.com/api/users',
  method: 'post',
  statusCode: 201,
  reqBody: { name: 'juan' },
  responseBody: { id: 1, name: 'juan' },
  options: { reqheaders: { authorization: 'Bearer token' } },
});
```

Si ningún interceptor coincide, nock rechaza la petición con un error `Nock: No match for request`.

### Parámetros de `createMock`

| Parámetro      | Tipo                                                        | Requerido | Descripción                                                             |
| -------------- | ----------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `url`          | `string`                                                    | Sí        | URL completa a interceptar                                              |
| `method`       | `HttpMethod`                                                | Sí        | Método HTTP: `get`, `post`, `put`, `head`, `patch`, `delete`, `options` |
| `statusCode`   | `number`                                                    | Sí        | Código de estado HTTP de la respuesta                                   |
| `responseBody` | `string \| object \| unknown[] \| Buffer \| (() => object)` | Sí        | Cuerpo de la respuesta                                                  |
| `reqBody`      | `string \| object \| Buffer`                                | No        | Cuerpo del request esperado (para métodos POST/PUT/PATCH)               |
| `queryParams`  | `QueryParams`                                               | No        | Query params esperados (si se omite, se usan los de la `url`)           |
| `options`      | `Options & { reqheaders? }`                                 | No        | Opciones adicionales de nock (incluyendo headers esperados)             |

<a name="testcontainers"></a>

## 🧪 TestContainers

[TestContainers](https://node.testcontainers.org/) es una librería que utiliza Docker para instanciar
servicios durante el entorno de testing, tanto local como en pipelines CI/CD.

### Global Container (docker-compose)

Instancia uno o más servicios a partir de un `docker-compose.yml`. Ideal para tests de integración
que necesitan múltiples servicios disponibles en toda la suite.

**1. Configurar `vitest.config.ts`:**

```typescript
//./vitest.config.ts
import { defineConfig, mergeConfig } from 'vitest/config';
import { vitestConfig } from '@tresdoce-nestjs-toolkit/commons';

export default mergeConfig(
  vitestConfig(),
  defineConfig({ test: { globalSetup: ['./vitest.globalSetup.ts'] } }),
);
```

**2. Crear `vitest.globalSetup.ts`:**

Vitest ejecuta `setup` antes de toda la suite y `teardown` al final. `initDockerCompose(...)` y
`closeDockerCompose(...)` **retornan** esas funciones, así que se exportan directamente. Por defecto el compose file
se busca en el directorio de trabajo (`'.'`), es decir, donde se ejecuta `vitest`.

```typescript
//./vitest.globalSetup.ts
import { closeDockerCompose, initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

export const setup = initDockerCompose(['mongo', 'redis', 'elasticsearch']);
export const teardown = closeDockerCompose({ removeVolumes: false });
```

Con opciones avanzadas:

```typescript
import path from 'node:path';
import { closeDockerCompose, initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

const services = ['mongo', 'redis'];
const composeFilePath = path.resolve(import.meta.dirname, 'test', 'docker');
const composeFile = 'docker-compose-test.yml';
const startupTimeout = 90000; // 90 segundos

export const setup = initDockerCompose(services, composeFilePath, composeFile, startupTimeout, {
  // Aplica Wait.forHealthCheck() a todos los containers
  useDefaultHealthCheckWaitStrategy: false,
  // Aplica Wait.forHealthCheck() solo a los containers listados (por nombre real del container)
  healthCheckWaitStrategyNames: ['my-service-1'],
});

export const teardown = closeDockerCompose({ removeVolumes: false });
```

**3. `docker-compose.yml` de ejemplo:**

Compose mínimo para un proyecto consumidor, con las mismas credenciales que los fixtures `TC*Options`
(`root` / `123456`, base `test_db`). Dejá solo los servicios que use tu proyecto.

```yaml
# ./docker-compose.yml
services:
  postgres:
    image: postgres:17-alpine
    container_name: my-app-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: root
      POSTGRES_PASSWORD: 123456
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U root -d test_db']
      interval: 5s
      timeout: 5s
      retries: 20

  mysql:
    image: mysql:8.4
    container_name: my-app-mysql
    ports:
      - '3306:3306'
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: test_db

  mongo:
    image: mongo:8.0
    container_name: my-app-mongo
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: 123456
      MONGO_INITDB_DATABASE: test_db

  redis:
    image: redis:8.2-alpine
    container_name: my-app-redis
    ports:
      - '6379:6379'
    command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456']
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '123456', 'ping']
      interval: 5s
      timeout: 5s
      retries: 20

  dynamodb:
    image: amazon/dynamodb-local:2.6.0
    container_name: my-app-dynamodb
    ports:
      - '8000:8000'

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:9.0.0
    container_name: my-app-elasticsearch
    ports:
      - '9200:9200'
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms1g -Xmx1g
      - xpack.security.enabled=false
```

Con ese compose, para esperar a que Postgres y Redis estén sanos (por nombre de **container**, no de servicio):

```typescript
export const setup = initDockerCompose(['postgres', 'redis'], '.', 'docker-compose.yml', 120000, {
  healthCheckWaitStrategyNames: ['my-app-postgres', 'my-app-redis'],
});
```

Salida en consola:

```
🐳 Initialize docker-compose...
• Services from docker-compose.yml: postgres, redis
✨ Container(s) initialized.
...
🐳 Terminate docker-compose...
👌 Container(s) stopped successfully.
```

Si el compose no levanta, `setup` **no** lanza error: loguea `😰 Error initializing container(s): ...` y retorna
`undefined`, por lo que los tests que dependen del servicio van a fallar después. Revisá ese log primero.

> ⚠️ En caso de fallas en los pipelines, revisar que el `docker-compose.yml` esté bien configurado y que el
> host del runner sea el mismo que usa Docker. Ej.: `http://localhost:6379` o `http://docker:6379`.

### Generic Container

Instancia un container único con una imagen de Docker. Ideal para proyectos que usan un solo servicio
o para tests aislados.

```typescript
import { TCPostgresOptions, testContainers } from '@tresdoce-nestjs-toolkit/test-utils';

vi.setConfig({ testTimeout: 70000 });

describe('TypeOrm - Postgres', () => {
  let app: INestApplication;
  let container: testContainers;

  beforeAll(async () => {
    container = new testContainers('postgres:17-alpine', TCPostgresOptions);
    await container.start();
    // container.getHost() / container.getMappedPort(5432) para armar la conexión
  });

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
});
```

**Esquema:** `new testContainers('<img-docker>:<tag>', options?, isSingleton?)`

`start()` usa `GenericContainer` de testcontainers con las opciones indicadas; si no se pasa `containerName` genera
`test-container-<uuid>`. Al iniciar, guarda el host en `globalThis.hostContainer`. Igual que `initDockerCompose`,
`start()` y `stop()` no lanzan errores: los loguean (`😰 [<container>] Error initializing container: ...`).

> Siempre indicá el tag de la imagen. El default (`postgres:13`) se mantiene solo por compatibilidad y es una versión sin soporte.

### Patrón Singleton de `testContainers`

Para compartir una sola instancia del container entre varios tests:

```typescript
// En lugar de `new testContainers(...)`:
const container = testContainers.getInstance('postgres:17-alpine', TCPostgresOptions);
await container.start();
```

`getInstance()` retorna la instancia singleton si ya fue creada, o crea una nueva con `isSingleton = true`. Las
instancias creadas con `new testContainers(...)` (sin `isSingleton`) son independientes y no afectan al singleton.
Crear con `new` una instancia con `isSingleton = true` cuando ya existe una lanza
`Use testContainers.getInstance() instead of new.`

### Troubleshooting

Para solucionar `failed: port is already allocated`, cambiar el puerto del `host` manteniendo el del `container`:

```typescript
new testContainers('mongo:8.0', {
  ...TCMongoOptions,
  ports: [{ container: 27017, host: 27013 }],
});
```

Para limpiar containers, imágenes y volumes:

```bash
docker system prune --volumes
docker system prune -a
```

<a name="fixtures"></a>

## 📦 Fixtures

### Configuración base (`appConfigBase`)

Objeto `Typings.AppConfig` utilizado por `config` y `dynamicConfig`. Solo define las keys requeridas (`project`,
`server`, `swagger`) más `params`, `redact` y `services`; los módulos opcionales se activan con `dynamicConfig`.

```json
{
  "project": {
    "apiPrefix": "API-TEST",
    "name": "nestjs-starter-test",
    "version": "0.0.1",
    "description": "NestJS Starter",
    "author": {
      "name": "Maximiliano \"Mex\" Delgado",
      "email": "mdelgado@tresdoce.com.ar",
      "url": "https://rudemex.github.io/"
    },
    "repository": {
      "type": "git",
      "url": "git+https://github.com/tresdoce/tresdoce-nestjs-toolkit.git"
    },
    "bugs": { "url": "https://github.com/tresdoce/tresdoce-nestjs-toolkit/issues" },
    "homepage": "https://github.com/tresdoce/tresdoce-nestjs-toolkit#readme"
  },
  "server": {
    "isProd": false,
    "appStage": "test",
    "port": 8081,
    "context": "api",
    "origins": ["http://localhost:3000", "http://localhost:8080"],
    "allowedHeaders": "Content-Type,Authorization,Set-Cookie,Access-Control-Allow-Origin,Cache-Control,Pragma",
    "allowedMethods": "GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS",
    "corsEnabled": true,
    "corsCredentials": false
  },
  "swagger": { "path": "docs", "enabled": false },
  "params": { "testEnv": "testKeyEnv-test" },
  "redact": {},
  "services": {
    "nestJsDocs": { "url": "https://docs.nestjs.com" },
    "rickAndMortyAPI": {
      "url": "https://rickandmortyapi.com/api",
      "timeout": 3000,
      "healthPath": "/api/character/1"
    }
  }
}
```

### `manifest`

Objeto con los metadatos del manifest de la aplicación (nombre, versión, descripción, dependencias, etc.)
basado en `appConfigBase`.

```typescript
import { manifest } from '@tresdoce-nestjs-toolkit/test-utils';

// manifest.name, manifest.version, manifest.apiPrefix, etc.
```

```json
{
  "appStage": "test",
  "archetypeVersion": "0.0.1",
  "apiPrefix": "API-TEST",
  "name": "nestjs-starter-test",
  "version": "0.0.1",
  "description": "NestJS Starter",
  "author": { "...": "..." },
  "repository": { "...": "..." },
  "homepage": "https://github.com/tresdoce/tresdoce-nestjs-toolkit#readme",
  "dependencies": { "@nestjs/common": "^12.2.0", "...": "..." },
  "devDependencies": { "vitest": "^5.0.0", "...": "..." }
}
```

### Fixtures de respuesta

Objetos de datos de ejemplo para usar en tests:

```typescript
import {
  fixtureUserResponse,
  fixtureUserArrayResponse,
  fixturePostResponse,
  fixturePostArrayResponse,
} from '@tresdoce-nestjs-toolkit/test-utils';
```

| Fixture                    | Descripción                                             |
| -------------------------- | ------------------------------------------------------- |
| `fixtureUserResponse`      | Un objeto usuario (`{ id, name, lastname }`)            |
| `fixtureUserArrayResponse` | Array de dos objetos usuario                            |
| `fixturePostResponse`      | Un objeto post (`{ id, title, description, isActive }`) |
| `fixturePostArrayResponse` | Array de dos objetos post                               |

```jsonc
// fixtureUserResponse
{ "id": 1, "name": "juan", "lastname": "perez" }

// fixturePostResponse
{ "id": 1, "title": "test post 1", "description": "this is a description of post 1", "isActive": true }
```

### Fixtures de TestContainers

Opciones (`ITestContainerOptions`) pre-configuradas para contenedores de test. No incluyen la imagen: se indica al
crear el container. Todas mapean el mismo puerto en el host que en el container, usan `reuse: true` y
`containerName: 'tresdoce-test-container-<servicio>'`.

| Fixture                  | Imagen recomendada                                    | Puerto interno |
| ------------------------ | ----------------------------------------------------- | -------------- |
| `TCRedisOptions`         | `redis:8.2-alpine`                                    | `6379`         |
| `TCMongoOptions`         | `mongo:8.0`                                           | `27017`        |
| `TCPostgresOptions`      | `postgres:17-alpine`                                  | `5432`         |
| `TCMySqlOptions`         | `mysql:8.4`                                           | `3306`         |
| `TCElasticSearchOptions` | `docker.elastic.co/elasticsearch/elasticsearch:9.0.0` | `9200`         |
| `TCDynamoDBOptions`      | `amazon/dynamodb-local:2.6.0`                         | `8000`         |

```typescript
import {
  TCMongoOptions,
  tcDatabaseName,
  tcPassword,
  tcUsername,
  testContainers,
} from '@tresdoce-nestjs-toolkit/test-utils';

const container = new testContainers('mongo:8.0', TCMongoOptions);
await container.start();

const uri = `mongodb://${tcUsername}:${tcPassword}@${container.getHost()}:${container.getMappedPort(27017)}/${tcDatabaseName}?authSource=admin`;
```

> `TCRedisOptions` define `REDIS_PASSWORD`, pero la imagen oficial de Redis ignora esa variable: para exigir password
> agregá `command: ['redis-server', '--requirepass', tcPassword]`.

Variables de entorno disponibles en los fixtures:

| Constante        | Valor                       |
| ---------------- | --------------------------- |
| `tcUsername`     | `'root'`                    |
| `tcPassword`     | `'123456'`                  |
| `tcDatabaseName` | `'test_db'`                 |
| `tcName`         | `'tresdoce-test-container'` |

<a name="api-reference"></a>

## 📖 API Reference

### `config`

`RegisterAs` de NestJS que provee la configuración base (`appConfigBase`) para `ConfigModule`.

### `dynamicConfig(args?: DeepPartial<Typings.AppConfig>)`

Función que retorna un `registerAs('config', ...)` con un clon de `appConfigBase` fusionado (merge profundo) con los
argumentos provistos.

### `VitestFN` (namespace)

| Export                        | Tipo                           | Descripción                           |
| ----------------------------- | ------------------------------ | ------------------------------------- |
| `VitestFN.config()`           | `() => Mock`                   | Mock que retorna `appConfigBase`      |
| `VitestFN.executionContext()` | `() => MockedExecutionContext` | Mock del `ExecutionContext` de NestJS |

### `createMock(options: CreateMock): Interceptor`

Crea un interceptor nock. Ver tabla de parámetros en la sección [CreateMock](#create-mock). Los tipos
`CreateMock`, `HttpMethod` y `QueryParams` también se exportan.

### `cleanAllMock(): void`

Limpia todos los interceptores nock activos (`nock.cleanAll()`).

### `testContainers`

Clase para manejar containers Docker individuales.

| Miembro                | Firma                                  | Descripción                                                           |
| ---------------------- | -------------------------------------- | --------------------------------------------------------------------- |
| `constructor`          | `(image, options?, isSingleton?)`      | Crea un nuevo container                                               |
| `getInstance` (static) | `(image?, options?) => testContainers` | Retorna la instancia singleton o crea una nueva                       |
| `start()`              | `() => Promise<void>`                  | Inicia el container                                                   |
| `stop(options?)`       | `(StopOptions?) => Promise<void>`      | Detiene el container                                                  |
| `getEnvs()`            | `() => Env \| null`                    | Retorna las variables de entorno configuradas (o `null`)              |
| `getContainer()`       | `() => StartedTestContainer`           | Retorna la instancia del container iniciado                           |
| `getHost()`            | `() => string`                         | Retorna el host del container (puede no ser `localhost`)              |
| `getName()`            | `() => string`                         | Retorna el nombre del container                                       |
| `getMappedPort(port)`  | `(number) => number`                   | Retorna el puerto mapeado en el host para el puerto de container dado |
| `isStarted()`          | `() => boolean`                        | Indica si el container está iniciado                                  |

### `ITestContainerOptions`

| Campo                 | Tipo                        | Descripción                                           |
| --------------------- | --------------------------- | ----------------------------------------------------- |
| `ports`               | `PortWithOptionalBinding[]` | Puertos a exponer (`[{ container, host }]`)           |
| `envs`                | `Env`                       | Variables de entorno del container                    |
| `networkName`         | `string`                    | Modo de red Docker                                    |
| `containerName`       | `string`                    | Nombre del container                                  |
| `startupTimeout`      | `number`                    | Timeout de inicio en milisegundos                     |
| `command`             | `string[]`                  | Comando a ejecutar en el container                    |
| `strategyHealthCheck` | `boolean`                   | Usa `Wait.forHealthCheck()` como estrategia de inicio |
| `reuse`               | `boolean`                   | Reutiliza el container si ya está corriendo           |

### `initDockerCompose(services?, composeFilePath?, composeFile?, startupTimeout?, options?)`

| Parámetro                                   | Tipo       | Default                | Descripción                           |
| ------------------------------------------- | ---------- | ---------------------- | ------------------------------------- |
| `services`                                  | `string[]` | `[]`                   | Servicios a iniciar (vacío = todos)   |
| `composeFilePath`                           | `string`   | `'.'`                  | Directorio del compose file           |
| `composeFile`                               | `string`   | `'docker-compose.yml'` | Nombre del archivo compose            |
| `startupTimeout`                            | `number`   | `60000`                | Timeout de inicio en ms               |
| `options.useDefaultHealthCheckWaitStrategy` | `boolean`  | `false`                | Aplica health check a todos           |
| `options.healthCheckWaitStrategyNames`      | `string[]` | `[]`                   | Containers con health check selectivo |

Retorna `() => Promise<StartedDockerComposeEnvironment | undefined>`, para usar como `setup` del `globalSetup` de
Vitest. El entorno iniciado también queda en `globalThis.__TESTCONTAINERS__`. El tipo de `options` se exporta como
`InitDockerComposeOptions`.

### `closeDockerCompose(options?: Partial<ComposeDownOptions>): () => Promise<void>`

Retorna una función async compatible con el `teardown` de `globalSetup` de Vitest que detiene el compose
(`{ removeVolumes, timeout }`) y limpia `globalThis.__TESTCONTAINERS__`.

### Utilidades

| Función    | Firma                                           | Descripción                          |
| ---------- | ----------------------------------------------- | ------------------------------------ |
| `delay`    | `(timeout?: number) => Promise<void>`           | Espera `timeout` ms (default: 10000) |
| `pathJoin` | `(dirName: string, fileName: string) => string` | Une dos segmentos de path            |

## 📄 Changelog

Todos los cambios notables de este paquete se documentarán en el archivo [Changelog](./CHANGELOG.md).

---

<div align="center">
    <a href="mailto:mdelgado@tresdoce.com.ar" target="_blank" alt="Send an email">
        <img src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/ab924d5bdd9a9b9acb3ca5721d4ce977c6b7f680/.readme-static/logo-mex-red.svg" width="120" alt="Logo - Mex" />
    </a><br/>
    <p>Made with ❤</p>
</div>
