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

import { ReadinessController } from '../health/controllers/readiness.controller';
import { CONFIG_OPTIONS } from '../health/constants';

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
      http.pingCheck = jest.fn().mockImplementation(() => ({ 'service-myService': mockHealthUp }));
      health.check = jest.fn().mockImplementation(() => mockExpectSimpleReadinessUp);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectSimpleReadinessUp);
    });

    it('should return down services with simple config', async () => {
      http.pingCheck = jest
        .fn()
        .mockImplementation(() => ({ 'service-myService': mockHealthDown }));
      health.check = jest.fn().mockImplementation(() => mockExpectSimpleReadinessDown);

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
      disk.checkStorage = jest.fn().mockImplementation(() => ({ storage: mockHealthUp }));
      memory.checkHeap = jest.fn().mockImplementation(() => ({ memory_heap: mockHealthUp }));
      typeOrm.pingCheck = jest
        .fn()
        .mockImplementation(() => ({ 'typeorm-postgres': mockHealthUp }));
      redis.pingCheck = jest.fn().mockImplementation(() => ({ redis: mockHealthUp }));
      memory.checkRSS = jest.fn().mockImplementation(() => ({ memory_rss: mockHealthUp }));
      http.pingCheck = jest.fn().mockImplementation(() => ({ 'service-myService': mockHealthUp }));
      health.check = jest.fn().mockImplementation(() => mockExpectReadinessUp);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectReadinessUp);
    });

    it('should return down services with extend config', async () => {
      disk.checkStorage = jest.fn().mockImplementation(() => ({ storage: mockHealthDown }));
      memory.checkHeap = jest.fn().mockImplementation(() => ({ memory_heap: mockHealthDown }));
      typeOrm.pingCheck = jest
        .fn()
        .mockImplementation(() => ({ 'typeorm-postgres': mockHealthDown }));
      redis.pingCheck = jest.fn().mockImplementation(() => ({ redis: mockHealthDown }));
      memory.checkRSS = jest.fn().mockImplementation(() => ({ memory_rss: mockHealthDown }));
      http.pingCheck = jest
        .fn()
        .mockImplementation(() => ({ 'service-myService': mockHealthDown }));
      health.check = jest.fn().mockImplementation(() => mockExpectReadinessDown);

      const readinessData = await controller.check();
      expect(readinessData).toEqual(mockExpectReadinessDown);
    });
  });
});
