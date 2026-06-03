<div align="center">
    <img alt="nestjs-logo" width="150" height="auto" src="https://raw.githubusercontent.com/tresdoce/tresdoce-nestjs-toolkit/master/.readme-static/iso-nestjs.svg" />
    <h1>Tresdoce NestJS Toolkit<br/>Test-Utils</h1>
</div>

<div align="center">
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NodeJS&message=v22.21.1&labelColor=339933&color=757575&logoColor=FFFFFF&logo=Node.js" alt="NodeJS"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NPM&message=v11.6.4&labelColor=CB3837&logoColor=FFFFFF&color=757575&logo=npm" alt="NPM"/>
    <img src="https://img.shields.io/static/v1.svg?style=flat&label=NestJS&message=v11.1.11&labelColor=E0234E&logoColor=FFFFFF&color=757575&logo=Nestjs" alt="NestJS"/><br/>
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
- [🎭 JestFN — mocks de Jest](#jestfn)
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
- Node.js v22.21.1 or higher ([Download](https://nodejs.org/es/download/))
- YARN ≥ 1.22.22 o NPM ≥ 11.6.4
- NestJS v11.1.11 or higher ([Documentación](https://nestjs.com/))
- [Docker](https://www.docker.com/) instalado (requerido para TestContainers)

<a name="install-dependencies"></a>

## 🛠️ Instalar dependencia

```
npm install -D @tresdoce-nestjs-toolkit/test-utils
```

```
yarn add -D @tresdoce-nestjs-toolkit/test-utils
```

## 📦 Dependencias internas

Este paquete no tiene dependencias internas del toolkit. Puede utilizarse de forma independiente.

<a name="use"></a>

## 👨‍💻 Configuración base y dinámica

### Configuración base para tests

La función `config` provee una configuración estándar del `ConfigModule` para los tests, basada en `appConfigBase`.

```typescript
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

La función `dynamicConfig` permite sobreescribir propiedades específicas de `appConfigBase` usando un merge profundo,
sin reemplazar completamente la configuración base.

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
              httpOptions: {
                timeout: 5000,
                maxRedirects: 5,
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

<a name="jestfn"></a>

## 🎭 JestFN — mocks de Jest

El namespace `JestFN` contiene funciones de mock listas para usar en los tests. Se importa como namespace:

```typescript
import { JestFN } from '@tresdoce-nestjs-toolkit/test-utils';
```

### `JestFN.config()`

Retorna un mock de función que, al ser llamada, devuelve `appConfigBase`. Útil para mockear la función de
configuración en tests unitarios.

```typescript
import { JestFN } from '@tresdoce-nestjs-toolkit/test-utils';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: JestFN.config(),
  })),
}));
```

### `JestFN.executionContext()`

Retorna un mock del `ExecutionContext` de NestJS con todos sus métodos (`switchToHttp`, `getRequest`,
`getResponse`, `getType`, `getClass`, `getHandler`) mockeados con `jest.fn().mockReturnThis()`.

```typescript
import { JestFN } from '@tresdoce-nestjs-toolkit/test-utils';

describe('MyInterceptor', () => {
  it('should call next', () => {
    const context = JestFN.executionContext();
    // context.switchToHttp() está disponible como mock
  });
});
```

<a name="create-mock"></a>

## 😝 CreateMock

`createMock` es una función que facilita la creación de mocks para peticiones HTTP utilizando **Nock** como base.
`cleanAllMock` limpia todos los interceptores nock registrados.

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
    JSON.parse(fs.readFileSync(path.resolve(__dirname, '../path/to/fixture.json'), 'utf8')),
});
```

### Parámetros de `createMock`

| Parámetro      | Tipo                                                        | Requerido | Descripción                                                             |
| -------------- | ----------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| `url`          | `string`                                                    | Sí        | URL completa a interceptar                                              |
| `method`       | `HttpMethod`                                                | Sí        | Método HTTP: `get`, `post`, `put`, `head`, `patch`, `delete`, `options` |
| `statusCode`   | `number`                                                    | Sí        | Código de estado HTTP de la respuesta                                   |
| `responseBody` | `string \| object \| unknown[] \| Buffer \| (() => object)` | Sí        | Cuerpo de la respuesta                                                  |
| `reqBody`      | `string \| object \| Buffer`                                | No        | Cuerpo del request esperado (para métodos POST/PUT/PATCH)               |
| `queryParams`  | `QueryParams`                                               | No        | Query params esperados en el request                                    |
| `options`      | `Options & { reqheaders? }`                                 | No        | Opciones adicionales de nock (incluyendo headers esperados)             |

<a name="testcontainers"></a>

## 🧪 TestContainers

[TestContainers](https://node.testcontainers.org/) es una librería que utiliza Docker para instanciar
servicios durante el entorno de testing, tanto local como en pipelines CI/CD.

### Global Container (docker-compose)

Instancia uno o más servicios a partir de un `docker-compose.yml`. Ideal para tests de integración
que necesitan múltiples servicios disponibles en toda la suite.

**1. Configurar `jest.config.ts`:**

```typescript
//./jest.config.ts
import { jestConfig } from '@tresdoce-nestjs-toolkit/commons';
import * as dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });

module.exports = {
  ...jestConfig(),
  globalSetup: './jest.globalSetup.ts',
  globalTeardown: './jest.globalTeardown.ts',
};
```

**2. Crear `jest.globalSetup.ts`:**

```typescript
//./jest.globalSetup.ts
import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

const services = ['mongo', 'redis', 'elasticsearch'];
module.exports = initDockerCompose(services);
```

Con opciones avanzadas:

```typescript
import { initDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';
import * as path from 'path';

const services = ['mongo', 'redis'];
const composeFilePath = path.resolve(__dirname, 'fixtures', 'docker-compose');
const composeFile = 'docker-compose-test.yml';
const startupTimeout = 90000; // 90 segundos

module.exports = initDockerCompose(services, composeFilePath, composeFile, startupTimeout, {
  // Aplica Wait.forHealthCheck() a todos los containers
  useDefaultHealthCheckWaitStrategy: false,
  // Aplica Wait.forHealthCheck() solo a los containers listados (por nombre real del container)
  healthCheckWaitStrategyNames: ['my-service-1'],
});
```

**3. Crear `jest.globalTeardown.ts`:**

```typescript
//./jest.globalTeardown.ts
import { closeDockerCompose } from '@tresdoce-nestjs-toolkit/test-utils';

module.exports = closeDockerCompose({ removeVolumes: false });
```

**4. `docker-compose.yml` de ejemplo:**

```yaml
version: '3.9'

services:
  mongo:
    image: mongo:5.0
    container_name: local-mongo
    restart: always
    ports:
      - '27017:27017'
    environment:
      TZ: 'America/Argentina/Buenos_Aires'
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: 123456
      MONGO_INITDB_DATABASE: test_db

  redis:
    image: redis:6.2-alpine
    container_name: local-redis
    restart: always
    ports:
      - '6379:6379'
    command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456']
```

> ⚠️ En caso de fallas en los pipelines, revisar que el `docker-compose.yml` esté bien configurado y que el
> host del runner sea el mismo que usa Docker. Ej.: `http://localhost:6379` o `http://docker:6379`.

### Generic Container

Instancia un container único con una imagen de Docker. Ideal para proyectos que usan un solo servicio
o para tests aislados.

```typescript
import { TCPostgresOptions, testContainers } from '@tresdoce-nestjs-toolkit/test-utils';

jest.setTimeout(70000);

describe('TypeOrm - Postgres', () => {
  let app: INestApplication;
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('postgres:13', TCPostgresOptions);
    await container.start();
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

### Patrón Singleton de `testContainers`

Para compartir una sola instancia del container entre varios tests:

```typescript
// En lugar de `new testContainers(...)`:
const container = testContainers.getInstance('postgres:13', TCPostgresOptions);
await container.start();
```

`getInstance()` retorna la instancia existente si ya fue creada, o crea una nueva con `_isSingleton = true`.

### Troubleshooting

Para solucionar `failed: port is already allocated`, cambiar el puerto del `host` manteniendo el del `container`:

```typescript
await new testContainers('mongo:5.0', {
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

Objeto de configuración de la aplicación utilizado por `config` y `dynamicConfig`.

### `manifest`

Objeto con los metadatos del manifest de la aplicación (nombre, versión, descripción, dependencias, etc.)
basado en `appConfigBase`.

```typescript
import { manifest } from '@tresdoce-nestjs-toolkit/test-utils';

// manifest.name, manifest.version, manifest.apiPrefix, etc.
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

### Fixtures de TestContainers

Opciones pre-configuradas para contenedores de test:

| Fixture                  | Imagen recomendada      | Puerto interno |
| ------------------------ | ----------------------- | -------------- |
| `TCRedisOptions`         | `redis:6.2-alpine`      | `6379`         |
| `TCMongoOptions`         | `mongo:5.0`             | `27017`        |
| `TCPostgresOptions`      | `postgres:13`           | `5432`         |
| `TCMySqlOptions`         | `mysql:8`               | `3306`         |
| `TCElasticSearchOptions` | `elasticsearch:8`       | `9200`         |
| `TCDynamoDBOptions`      | `amazon/dynamodb-local` | `8000`         |

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

### `dynamicConfig(args?: DeepPartial<AppConfig>)`

Función que retorna un `RegisterAs` con la configuración base fusionada con los argumentos provistos.

### `JestFN` (namespace)

| Export                      | Tipo                           | Descripción                           |
| --------------------------- | ------------------------------ | ------------------------------------- |
| `JestFN.config()`           | `() => jest.Mock`              | Mock que retorna `appConfigBase`      |
| `JestFN.executionContext()` | `() => MockedExecutionContext` | Mock del `ExecutionContext` de NestJS |

### `createMock(options: CreateMock): Interceptor`

Crea un interceptor nock. Ver tabla de parámetros en la sección [CreateMock](#create-mock).

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
| `getEnvs()`            | `() => Env`                            | Retorna las variables de entorno del container                        |
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

### `closeDockerCompose(options?): () => Promise<void>`

Retorna una función async compatible con `globalTeardown` de Jest que detiene el compose.

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
