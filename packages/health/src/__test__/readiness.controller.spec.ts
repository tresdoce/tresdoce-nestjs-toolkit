import { ServiceUnavailableException } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import {
  DiskHealthIndicator,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ReadinessController } from '../health/controllers/readiness.controller.js';
import { CONFIG_OPTIONS } from '../health/constants.js';

const mockConfigSimple = {
  services: {
    myService: { url: 'http://localhost:8082' },
  },
};

const mockConfig = {
  health: {
    skipChecks: [],
    storage: {
      path: '/',
      threshold: 250 * 1024 * 1024 * 1024,
    },
    memory: {
      heap: 250 * 1024 * 1024,
      rss: 250 * 1024 * 1024,
    },
  },
  database: {
    typeorm: {
      type: 'postgres',
    },
  },
  redis: {
    host: 'localhost',
    port: 6379,
    username: 'test',
    password: '123456',
  },
  elasticsearch: {
    name: 'test-app',
    node: 'http://localhost:9200',
  },
  camunda: {
    baseUrl: 'http://localhost:8080/engine-rest',
  },
  services: {
    myService: {
      url: 'http://localhost:8082',
      timeout: 3000,
      healthPath: '/liveness',
    },
    demoApi: {
      url: 'https://nestjs-starter.tresdoce.com.ar',
      timeout: 3000,
    },
  },
};

const mockHealthUp = { status: 'up' };

const mockHealthDown = {
  status: 'down',
  message: 'connect ECONNREFUSED 127.0.0.1:XXXX',
};

const mockExpectSimpleReadinessUp = {
  status: 'ok',
  info: {
    'service-myService': mockHealthUp,
  },
  error: {},
  details: {
    'service-myService': mockHealthUp,
  },
};

const mockExpectSimpleReadinessDown = {
  status: 'error',
  info: {},
  error: {
    'service-myService': mockHealthDown,
  },
  details: {
    'service-myService': mockHealthDown,
  },
};

const mockExpectReadinessUp = {
  status: 'ok',
  info: {
    storage: mockHealthUp,
    memory_heap: mockHealthUp,
    memory_rss: mockHealthUp,
    redis: mockHealthUp,
    'typeorm-postgres': mockHealthUp,
    elasticsearch: mockHealthUp,
    camunda: mockHealthUp,
    'service-myService': mockHealthUp,
    'service-demoApi': mockHealthUp,
  },
  error: {},
  details: {
    storage: mockHealthUp,
    memory_heap: mockHealthUp,
    memory_rss: mockHealthUp,
    redis: mockHealthUp,
    'typeorm-postgres': mockHealthUp,
    elasticsearch: mockHealthUp,
    camunda: mockHealthUp,
    'service-myService': mockHealthUp,
    'service-demoApi': mockHealthUp,
  },
};

const mockExpectReadinessDown = {
  status: 'error',
  info: {
    storage: mockHealthUp,
    memory_heap: mockHealthUp,
    memory_rss: mockHealthUp,
    'service-demoApi': mockHealthUp,
  },
  error: {
    redis: mockHealthDown,
    'typeorm-postgres': mockHealthDown,
    elasticsearch: mockHealthDown,
    camunda: mockHealthDown,
    'service-myService': mockHealthDown,
  },
  details: {
    storage: mockHealthUp,
    memory_heap: mockHealthUp,
    memory_rss: mockHealthUp,
    redis: mockHealthDown,
    'typeorm-postgres': mockHealthDown,
    elasticsearch: mockHealthDown,
    camunda: mockHealthDown,
    'service-myService': mockHealthDown,
    'service-demoApi': mockHealthUp,
  },
};

describe('ReadinessController', () => {
  describe('Simple config', () => {
    let controller: ReadinessController;
    let health: HealthCheckService;
    let http: HttpHealthIndicator;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [TerminusModule, HttpModule],
        controllers: [ReadinessController],
        providers: [
          {
            provide: CONFIG_OPTIONS,
            useValue: mockConfigSimple,
          },
        ],
      }).compile();

      controller = module.get<ReadinessController>(ReadinessController);
      health = await module.resolve<HealthCheckService>(HealthCheckService);
      http = await module.resolve<HttpHealthIndicator>(HttpHealthIndicator as any);
    });

    it('should be defined with simple config', () => {
      expect(controller).toBeDefined();
    });

    it('should return up services with simple config', async () => {
      http.pingCheck = vi.fn().mockImplementation(() => ({ 'service-myService': mockHealthUp }));
      health.check = vi.fn().mockImplementation(() => mockExpectSimpleReadinessUp);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectSimpleReadinessUp);
    });

    it('should return down services with simple config', async () => {
      http.pingCheck = vi.fn().mockImplementation(() => ({ 'service-myService': mockHealthDown }));
      health.check = vi.fn().mockImplementation(() => mockExpectSimpleReadinessDown);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectSimpleReadinessDown);
    });
  });

  describe('Extend config', () => {
    let controller: ReadinessController;
    let health: HealthCheckService;
    let http: HttpHealthIndicator;
    let disk: DiskHealthIndicator;
    let memory: MemoryHealthIndicator;
    let typeOrm: TypeOrmHealthIndicator;
    let redis: MicroserviceHealthIndicator;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [TerminusModule, HttpModule],
        controllers: [ReadinessController],
        providers: [
          {
            provide: CONFIG_OPTIONS,
            useValue: mockConfig,
          },
        ],
      }).compile();

      controller = module.get<ReadinessController>(ReadinessController);
      health = await module.resolve<HealthCheckService>(HealthCheckService);
      http = await module.resolve<HttpHealthIndicator>(HttpHealthIndicator as any);
      disk = await module.resolve<DiskHealthIndicator>(DiskHealthIndicator);
      memory = await module.resolve<MemoryHealthIndicator>(MemoryHealthIndicator);
      typeOrm = await module.resolve<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
      redis = await module.resolve<MicroserviceHealthIndicator>(MicroserviceHealthIndicator);
    });

    it('should be defined with extend config', () => {
      expect(controller).toBeDefined();
    });

    it('should return up services with extend config', async () => {
      disk.checkStorage = vi.fn().mockImplementation(() => ({ storage: mockHealthUp }));
      memory.checkHeap = vi.fn().mockImplementation(() => ({ memory_heap: mockHealthUp }));
      typeOrm.pingCheck = vi.fn().mockImplementation(() => ({ 'typeorm-postgres': mockHealthUp }));
      redis.pingCheck = vi.fn().mockImplementation(() => ({ redis: mockHealthUp }));
      memory.checkRSS = vi.fn().mockImplementation(() => ({ memory_rss: mockHealthUp }));
      http.pingCheck = vi.fn().mockImplementation(() => ({ 'service-myService': mockHealthUp }));
      health.check = vi.fn().mockImplementation(() => mockExpectReadinessUp);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectReadinessUp);
    });

    it('should return down services with extend config', async () => {
      disk.checkStorage = vi.fn().mockImplementation(() => ({ storage: mockHealthDown }));
      memory.checkHeap = vi.fn().mockImplementation(() => ({ memory_heap: mockHealthDown }));
      typeOrm.pingCheck = vi
        .fn()
        .mockImplementation(() => ({ 'typeorm-postgres': mockHealthDown }));
      redis.pingCheck = vi.fn().mockImplementation(() => ({ redis: mockHealthDown }));
      memory.checkRSS = vi.fn().mockImplementation(() => ({ memory_rss: mockHealthDown }));
      http.pingCheck = vi.fn().mockImplementation(() => ({ 'service-myService': mockHealthDown }));
      health.check = vi.fn().mockImplementation(() => mockExpectReadinessDown);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectReadinessDown);
    });
  });
});

describe('ReadinessController - real HealthCheckService', () => {
  const up = (key: string) => ({ [key]: { status: 'up' } });
  const down = (key: string, message = 'connect ECONNREFUSED') => ({
    [key]: { status: 'down', message },
  });

  let httpSpy: ReturnType<typeof vi.spyOn>;
  let diskSpy: ReturnType<typeof vi.spyOn>;
  let heapSpy: ReturnType<typeof vi.spyOn>;
  let rssSpy: ReturnType<typeof vi.spyOn>;
  let typeOrmSpy: ReturnType<typeof vi.spyOn>;
  let microserviceSpy: ReturnType<typeof vi.spyOn>;

  const createController = async (appConfig: any): Promise<ReadinessController> => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule.forRoot({ logger: false })],
      controllers: [ReadinessController],
      providers: [{ provide: CONFIG_OPTIONS, useValue: appConfig }],
    }).compile();
    return module.get<ReadinessController>(ReadinessController);
  };

  beforeEach(() => {
    httpSpy = vi
      .spyOn(HttpHealthIndicator.prototype, 'pingCheck')
      .mockImplementation(async (key: string) => up(key) as any);
    diskSpy = vi
      .spyOn(DiskHealthIndicator.prototype, 'checkStorage')
      .mockImplementation(async (key: string) => up(key) as any);
    heapSpy = vi
      .spyOn(MemoryHealthIndicator.prototype, 'checkHeap')
      .mockImplementation(async (key: string) => up(key) as any);
    rssSpy = vi
      .spyOn(MemoryHealthIndicator.prototype, 'checkRSS')
      .mockImplementation(async (key: string) => up(key) as any);
    typeOrmSpy = vi
      .spyOn(TypeOrmHealthIndicator.prototype, 'pingCheck')
      .mockImplementation((key: string) => Promise.resolve(up(key)) as any);
    microserviceSpy = vi
      .spyOn(MicroserviceHealthIndicator.prototype, 'pingCheck')
      .mockImplementation((key: string) => Promise.resolve(up(key)) as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should run every configured check and return ok', async () => {
    const controller = await createController(mockConfig);
    const result = await controller.check();

    expect(result.status).toEqual('ok');
    expect(Object.keys(result.details).sort()).toEqual(
      [
        'storage',
        'memory_heap',
        'memory_rss',
        'service-myService',
        'service-demoApi',
        'typeorm-postgres',
        'redis',
        'elasticsearch',
        'camunda',
      ].sort(),
    );
    expect(diskSpy).toHaveBeenCalledWith('storage', mockConfig.health.storage);
    expect(heapSpy).toHaveBeenCalledWith('memory_heap', mockConfig.health.memory.heap);
    expect(rssSpy).toHaveBeenCalledWith('memory_rss', mockConfig.health.memory.rss);
    expect(httpSpy).toHaveBeenCalledWith('service-myService', 'http://localhost:8082/liveness', {
      timeout: 3000,
    });
    expect(httpSpy).toHaveBeenCalledWith(
      'service-demoApi',
      'https://nestjs-starter.tresdoce.com.ar/health/liveness',
      { timeout: 3000 },
    );
    expect(httpSpy).toHaveBeenCalledWith('elasticsearch', 'http://localhost:9200', {});
    expect(httpSpy).toHaveBeenCalledWith('camunda', 'http://localhost:8080/engine-rest/version');
    expect(typeOrmSpy).toHaveBeenCalledWith('typeorm-postgres');
    expect(microserviceSpy).toHaveBeenCalledWith('redis', {
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379, username: 'test', password: '123456' },
    });
  });

  it('should throw ServiceUnavailableException (503) when a check is down', async () => {
    typeOrmSpy.mockImplementation((key: string) => Promise.resolve(down(key)) as any);
    const controller = await createController(mockConfig);

    const error = await controller.check().catch((e) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect(error.getStatus()).toEqual(503);
    expect(error.getResponse()).toMatchObject({
      status: 'error',
      error: down('typeorm-postgres'),
      info: { storage: { status: 'up' } },
    });
  });

  it('should skip the checks listed in health.skipChecks', async () => {
    const controller = await createController({
      ...mockConfig,
      health: {
        ...mockConfig.health,
        skipChecks: ['storage', 'memory', 'typeorm', 'redis', 'elasticsearch', 'camunda'],
      },
    });
    const result = await controller.check();

    expect(Object.keys(result.details).sort()).toEqual(['service-demoApi', 'service-myService']);
    expect(diskSpy).not.toHaveBeenCalled();
    expect(heapSpy).not.toHaveBeenCalled();
    expect(typeOrmSpy).not.toHaveBeenCalled();
    expect(microserviceSpy).not.toHaveBeenCalled();
  });

  it('should not fail when health is not configured', async () => {
    const controller = await createController({
      redis: { host: 'localhost', port: 6379 },
      camunda: { baseUrl: 'http://localhost:8080/engine-rest' },
    });
    const result = await controller.check();

    expect(Object.keys(result.details).sort()).toEqual(['camunda', 'redis']);
  });

  it('should return ok with no checks when nothing is configured', async () => {
    const controller = await createController({});
    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    });
  });

  it('should only add the memory checks that are configured', async () => {
    const controller = await createController({ health: { memory: { heap: 1024 } } });
    const result = await controller.check();

    expect(Object.keys(result.details)).toEqual(['memory_heap']);
    expect(rssSpy).not.toHaveBeenCalled();
  });

  it('should only add the rss check when heap is not configured', async () => {
    const controller = await createController({ health: { memory: { rss: 1024 } } });
    const result = await controller.check();

    expect(Object.keys(result.details)).toEqual(['memory_rss']);
  });

  it('should mark a service with an invalid url as down instead of throwing', async () => {
    const controller = await createController({
      services: { noUrl: { url: undefined }, empty: null, ok: { url: 'http://localhost:8082' } },
    });

    const error = await controller.check().catch((e) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect(error.getResponse()).toMatchObject({
      status: 'error',
      error: {
        'service-noUrl': { status: 'down', message: 'Invalid URL: undefined' },
        'service-empty': { status: 'down', message: 'Invalid URL: undefined' },
      },
      info: up('service-ok'),
    });
    expect(httpSpy).toHaveBeenCalledWith('service-ok', 'http://localhost:8082/health/liveness', {
      timeout: 0,
    });
  });

  it('should map the redis options (name, database and TLS)', async () => {
    const controller = await createController({
      redis: { name: 'cache', host: 'redis.local', port: 6380, database: 2, protocol: 'rediss' },
    });
    const result = await controller.check();

    expect(result.details).toEqual(up('redis-cache'));
    expect(microserviceSpy).toHaveBeenCalledWith('redis-cache', {
      transport: Transport.REDIS,
      options: {
        host: 'redis.local',
        port: 6380,
        username: undefined,
        password: undefined,
        db: 2,
        tls: {},
      },
    });
  });

  it.each([
    [
      'NodeOptions[] with basic auth',
      {
        node: [{ url: new URL('http://es-1:9200') }, { url: new URL('http://es-2:9200') }],
        auth: { username: 'elastic', password: 'secret' },
      },
      'http://es-1:9200/',
      { auth: { username: 'elastic', password: 'secret' } },
    ],
    [
      'nodes string with bearer auth',
      { nodes: 'http://es:9200', auth: { bearer: 'token' } },
      'http://es:9200',
      { headers: { Authorization: 'Bearer token' } },
    ],
    [
      'string[] with apiKey string',
      { node: ['http://es:9200'], auth: { apiKey: 'base64key' } },
      'http://es:9200',
      { headers: { Authorization: 'ApiKey base64key' } },
    ],
    [
      'apiKey object',
      { node: 'http://es:9200', auth: { apiKey: { id: 'id', api_key: 'key' } } },
      'http://es:9200',
      { headers: { Authorization: `ApiKey ${Buffer.from('id:key').toString('base64')}` } },
    ],
  ])('should ping elasticsearch with %s', async (_label, elasticsearch, url, options) => {
    const controller = await createController({ elasticsearch });
    await controller.check();

    expect(httpSpy).toHaveBeenCalledWith('elasticsearch', url, options);
  });
});
