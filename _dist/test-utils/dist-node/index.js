'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var config$1 = require('@nestjs/config');
var _ = _interopDefault(require('lodash'));
var testcontainers = require('testcontainers');
var path = _interopDefault(require('path'));
var nock = _interopDefault(require('nock'));
var url = require('url');

const appConfigBase = {
  project: {
    apiPrefix: 'API-TEST',
    name: 'nestjs-starter-test',
    version: '0.0.1',
    description: 'NestJS Starter',
    author: {
      name: 'Maximiliano "Mex" Delgado',
      email: 'mdelgado@tresdoce.com.ar',
      url: 'https://rudemex.github.io/'
    },
    repository: {
      type: 'git',
      url: 'git+https://github.com/tresdoce/tresdoce-nestjs-toolkit.git'
    },
    bugs: {
      url: 'https://github.com/tresdoce/tresdoce-nestjs-toolkit/issues'
    },
    homepage: 'https://github.com/tresdoce/tresdoce-nestjs-toolkit#readme'
  },
  server: {
    isProd: false,
    appStage: 'test',
    port: 8081,
    context: 'api',
    origins: ['http://localhost:3000', 'http://localhost:8080'],
    allowedHeaders: 'Content-Type,Authorization,Set-Cookie,Access-Control-Allow-Origin,Cache-Control,Pragma',
    allowedMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    corsEnabled: true,
    corsCredentials: false
  },
  swagger: {
    path: 'docs',
    enabled: false
  },
  params: {
    testEnv: 'testKeyEnv-test'
  },
  services: {
    rickAndMortyAPI: {
      url: 'https://rickandmortyapi.com/api',
      timeout: 3000,
      healthPath: '/api/character/1'
    }
  }
};

const manifest = {
  appStage: 'test',
  archetypeVersion: '0.0.1',
  apiPrefix: appConfigBase.project.apiPrefix,
  name: appConfigBase.project.name,
  version: appConfigBase.project.version,
  description: appConfigBase.project.description,
  author: appConfigBase.project.author,
  repository: appConfigBase.project.repository,
  homepage: appConfigBase.project.homepage,
  dependencies: {
    '@tresdoce-nestjs-toolkit/archetype': '0.0.1',
    '@tresdoce-nestjs-toolkit/health': '0.0.1',
    '@tresdoce-nestjs-toolkit/http-client': '0.0.1',
    '@nestjs/class-transformer': '^0.4.0',
    '@nestjs/class-validator': '^0.13.3',
    '@nestjs/common': '^9.2.1',
    '@nestjs/config': '^2.2.0',
    '@nestjs/core': '^8.2.5',
    '@nestjs/platform-express': '^8.2.5',
    '@nestjs/swagger': '^5.1.5',
    'cross-env': '^7.0.3',
    'swagger-ui-express': '^4.3.0'
  },
  devDependencies: {
    '@tresdoce-nestjs-toolkit/commons': '0.0.1',
    '@nestjs/cli': '^9.1.8',
    '@nestjs/schematics': '^9.1.0',
    '@nestjs/testing': '^9.4.0',
    husky: '^4.3.8',
    jest: '^27.4.7'
  }
};

const tcUsername = 'root';
const tcPassword = '123456';
const tcDatabaseName = 'test_db';
const tcName = 'tresdoce-test-container';
/* Test Containers - Redis options */
const TCRedisOptions = {
  ports: [{
    container: 6379,
    host: 6379
  }],
  envs: {
    REDIS_USERNAME: tcUsername,
    REDIS_PASSWORD: tcPassword,
    REDIS_HOST: 'cache'
  },
  containerName: `${tcName}-redis`,
  reuse: true
};
/* Test Containers - DynamoDB */
const TCDynamoDBOptions = {
  ports: [{
    container: 8000,
    host: 8000
  }],
  envs: {
    AWS_ACCESS_KEY_ID: 'local',
    AWS_SECRET_ACCESS_KEY: 'local',
    AWS_REGION: 'us-east-1'
  },
  containerName: `${tcName}-dynamodb`,
  reuse: true
};
/* Test Containers - MongoDB options */
const TCMongoOptions = {
  ports: [{
    container: 27017,
    host: 27017
  }],
  envs: {
    MONGO_INITDB_ROOT_USERNAME: tcUsername,
    MONGO_INITDB_ROOT_PASSWORD: tcPassword,
    MONGO_INITDB_DATABASE: tcDatabaseName
  },
  containerName: `${tcName}-mongo`,
  reuse: true
};
/* Test Containers - Postgres options */
const TCPostgresOptions = {
  ports: [{
    container: 5432,
    host: 5432
  }],
  envs: {
    POSTGRES_USER: tcUsername,
    POSTGRES_PASSWORD: tcPassword,
    POSTGRES_DB: tcDatabaseName
  },
  containerName: `${tcName}-postgres`,
  reuse: true
};
/* Test Containers - MySql options */
const TCMySqlOptions = {
  ports: [{
    container: 3306,
    host: 3306
  }],
  envs: {
    //'MYSQL_USER': tcUsername,
    MYSQL_ROOT_PASSWORD: tcPassword,
    MYSQL_PASSWORD: tcPassword,
    MYSQL_DATABASE: tcDatabaseName
  },
  containerName: `${tcName}-mysql`,
  reuse: true
};
/* Test Containers - Elasticsearch */
const TCElasticSearchOptions = {
  ports: [{
    container: 9200,
    host: 9200
  }],
  envs: {
    'discovery.type': 'single-node',
    'node.name': 'elasticsearch',
    ES_JAVA_OPTS: '-Xms1g -Xmx1g',
    'xpack.security.enabled': false
  },
  containerName: `${tcName}-elasticsearch`,
  reuse: true
};

/* USERS */
const fixtureUserResponse = {
  id: 1,
  name: 'juan',
  lastname: 'perez'
};
const fixtureUserArrayResponse = [fixtureUserResponse, {
  id: 2,
  name: 'juan pablo',
  lastname: 'garcia'
}];
/* POSTS */
const fixturePostResponse = {
  id: 1,
  title: 'test post 1',
  description: 'this is a description of post 1',
  isActive: true
};
const fixturePostArrayResponse = [fixturePostResponse, {
  id: 2,
  title: 'test post 2',
  description: 'this is a description of post 2',
  isActive: true
}];

var configuration = config$1.registerAs('config', () => appConfigBase);

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectDestructuringEmpty(t) {
  if (null == t) throw new TypeError("Cannot destructure " + t);
}

const dynamicConfig = (_ref = {}) => {
  let args = _extends({}, (_objectDestructuringEmpty(_ref), _ref));
  return config$1.registerAs('config', () => _.mergeWith(_.cloneDeep(appConfigBase), args));
};

const config = () => jest.fn().mockImplementation(() => appConfigBase);
const executionContext = () => ({
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis()
});



var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    config: config,
    executionContext: executionContext
});

class TestContainersTD {
  /* istanbul ignore next */
  constructor(_image = 'postgres:13', _options, _isSingleton = false) {
    this._image = _image;
    this._options = _options;
    this._isSingleton = _isSingleton;
    if (_isSingleton && TestContainersTD._instance) throw new Error('Use testContainers.getInstance() instead of new.');
    TestContainersTD._instance = this;
  }
  /**
   * Get instance
   */
  /* istanbul ignore next */
  static getInstance(_image, _options) {
    var _TestContainersTD$_in;
    return (_TestContainersTD$_in = TestContainersTD._instance) !== null && _TestContainersTD$_in !== void 0 ? _TestContainersTD$_in : TestContainersTD._instance = new TestContainersTD(_image, _options, true);
  }
  prepareContainer(options) {
    const genericContainer = new testcontainers.GenericContainer(`${this._image}`);
    /* Add container name*/
    /* istanbul ignore next */
    if (_.has(options, 'containerName') && !_.isEmpty(options.containerName)) {
      genericContainer.withName(options.containerName);
    } else {
      /* istanbul ignore next */
      genericContainer.withName(`test-container-${new testcontainers.RandomUuid().nextUuid()}`);
    }
    /* Add container ports */
    /* istanbul ignore next */
    if (_.has(options, 'networkName') && !_.isEmpty(options.networkName)) {
      genericContainer.withNetworkMode(options.networkName);
    }
    /* Add container ports */
    if (_.has(options, 'ports') && !_.isEmpty(options.ports)) {
      genericContainer.withExposedPorts(...options.ports);
    }
    /* Add container envs */
    if (_.has(options, 'envs') && !_.isEmpty(options.envs)) {
      genericContainer.withEnvironment(options.envs);
    }
    /* Add command to container */
    /* istanbul ignore next */
    if (_.has(options, 'command') && !_.isEmpty(options.command)) {
      genericContainer.withCommand(options.command);
    }
    /* Add startup timeout container */
    /* istanbul ignore next */
    if (_.has(options, 'startupTimeout')) {
      genericContainer.withStartupTimeout(options.startupTimeout);
    }
    /* Add strategy to start container */
    /* istanbul ignore next */
    if (_.has(options, 'strategyHealthCheck') && options.strategyHealthCheck) {
      genericContainer.withWaitStrategy(testcontainers.Wait.forHealthCheck());
    }
    /* Add container reuse*/
    if (_.has(options, 'reuse') && options.reuse) {
      genericContainer.withReuse();
    }
    return genericContainer;
  }
  /**
   * Started container
   */
  async start() {
    try {
      this._container = await this.prepareContainer(this._options).start();
      global.hostContainer = this._container.getHost();
      console.info(`✨ Container initialized: ${this.getName()}`);
    } catch (e) {
      /* istanbul ignore next */
      console.error(`😰 [${this._options.containerName}] Error initializing container: ${e}`);
    }
  }
  /**
   * Stop container
   * @param options optional stop options of test containers.
   */
  async stop(options) {
    try {
      const containerName = this.getName();
      await this._container.stop(options);
      console.info(`👌 Container stopped successfully: ${containerName}`);
    } catch (e) {
      /* istanbul ignore next */
      console.error(`😒 [${this._options.containerName}] Container not initialized`);
    }
  }
  /*=============================*/
  /**
   * Get envs
   */
  /* istanbul ignore next */
  getEnvs() {
    return _.has(this._options, 'envs') ? this._options.envs : null;
  }
  /**
   * Get container
   */
  getContainer() {
    return this._container;
  }
  /**
   * Get host of container
   */
  getHost() {
    return this._container.getHost();
  }
  /**
   * Get container name
   */
  getName() {
    return this._container.getName();
  }
  /**
   * Get mapped ports
   */
  getMappedPort(port) {
    return this._container.getMappedPort(port);
  }
}

let environment;
const initDockerCompose = (_services, _composeFilePath = '.', _composeFile = 'docker-compose.yml', _startupTimeout = 60000) => {
  return async () => {
    console.info(`🐳 Initialize docker-compose...`);
    if (_.isEmpty(_services)) {
      console.log(`• All services from ${_composeFile}`);
    } else {
      console.log(`• Services from ${_composeFile}: ${_services.join(', ')}`);
    }
    try {
      environment = await new testcontainers.DockerComposeEnvironment(_composeFilePath, _composeFile).withStartupTimeout(_startupTimeout).up(_services);
      global.__TESTCONTAINERS__ = environment;
      console.info(`✨ Container(s) initialized.`);
      return environment;
    } catch (_error) {
      /* istanbul ignore next */
      console.error(`😰 Error initializing container(s): ${_error}`);
    }
  };
};
const closeDockerCompose = _options => {
  return async () => {
    console.info('🐳 Terminate docker-compose...');
    try {
      await environment.down(_options);
      console.info(`👌 Container(s) stopped successfully.`);
    } catch (_error) {
      /* istanbul ignore next */
      console.error(`😒 Container(s) not initialized.`);
    }
  };
};

const delay = async (timeout = 10000) => await new Promise(r => setTimeout(r, timeout));
const pathJoin = (dirName, fileName) => path.join(dirName, fileName);

/**
 * HTTP methods that expect a body in the request.
 */
const METHODS_WITH_BODY = ['post', 'put', 'patch'];
/**
 * Creates a nock mock based on provided options.
 *
 * @param _options - Configuration options for the mock.
 * @returns A configured nock interceptor.
 * @example
 *
 * // Using a JSON object as responseBody
 * const mock1 = createMock({
 *   url: 'http://example.com/api/data',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: { success: true }
 * });
 *
 * // Using a string as responseBody
 * const mock2 = createMock({
 *   url: 'http://example.com/api/message',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: 'Success message'
 * });
 *
 * // Using a Buffer as responseBody
 * const mock3 = createMock({
 *   url: 'http://example.com/api/file',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: Buffer.from('Some binary data')
 * });
 *
 * // Using a function returning a JSON object as responseBody
 * const mock4 = createMock({
 *   url: 'http://example.com/api/dynamicData',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: () => JSON.parse(fs.readFileSync('path/to/fixture.json', 'utf8'))
 * });
 */
const createMock = _options => {
  let {
    url: url$1,
    method,
    statusCode,
    responseBody,
    options = {},
    reqBody,
    queryParams
  } = _options;
  const parsedUrl = new url.URL(url$1);
  const baseUrl = parsedUrl.origin;
  const endpoint = parsedUrl.pathname;
  /* istanbul ignore next */
  if (!baseUrl || !method || !endpoint) {
    /* istanbul ignore next */
    throw new Error('Missing required parameters: baseUrl, method, and/or endpoint.');
  }
  if (typeof responseBody === 'function') {
    responseBody = responseBody();
  }
  const scope = nock(baseUrl, options);
  let interceptor;
  if (METHODS_WITH_BODY.includes(method)) {
    if (typeof reqBody === 'object' && !(reqBody instanceof Buffer)) {
      interceptor = scope[method](endpoint, JSON.stringify(reqBody));
    } else {
      interceptor = scope[method](endpoint, reqBody);
    }
  } else {
    interceptor = scope[method](endpoint);
  }
  if (queryParams) {
    interceptor.query(queryParams);
  }
  interceptor.reply(statusCode, responseBody);
  return interceptor;
};
/**
 * Cleans all the mocks created by nock.
 */
const cleanAllMock = () => nock.cleanAll();

exports.JestFN = index;
exports.TCDynamoDBOptions = TCDynamoDBOptions;
exports.TCElasticSearchOptions = TCElasticSearchOptions;
exports.TCMongoOptions = TCMongoOptions;
exports.TCMySqlOptions = TCMySqlOptions;
exports.TCPostgresOptions = TCPostgresOptions;
exports.TCRedisOptions = TCRedisOptions;
exports.appConfigBase = appConfigBase;
exports.cleanAllMock = cleanAllMock;
exports.closeDockerCompose = closeDockerCompose;
exports.config = configuration;
exports.createMock = createMock;
exports.delay = delay;
exports.dynamicConfig = dynamicConfig;
exports.fixturePostArrayResponse = fixturePostArrayResponse;
exports.fixturePostResponse = fixturePostResponse;
exports.fixtureUserArrayResponse = fixtureUserArrayResponse;
exports.fixtureUserResponse = fixtureUserResponse;
exports.initDockerCompose = initDockerCompose;
exports.manifest = manifest;
exports.pathJoin = pathJoin;
exports.tcDatabaseName = tcDatabaseName;
exports.tcName = tcName;
exports.tcPassword = tcPassword;
exports.tcUsername = tcUsername;
exports.testContainers = TestContainersTD;
//# sourceMappingURL=index.js.map
