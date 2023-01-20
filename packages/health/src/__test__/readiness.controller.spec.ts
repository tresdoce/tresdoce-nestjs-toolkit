import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import {
  HealthCheckService,
  HttpHealthIndicator,
  TerminusModule,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { ReadinessController } from '../health/controllers/readiness.controller';
import { CONFIG_OPTIONS } from '../health/constants';

const mockedConfig = {
  services: {
    myService: {
      url: 'http://localhost:8082',
      timeout: 3000,
    },
    demoApi: {
      url: 'https://nestjs-starter.up.railway.app',
      timeout: 3000,
      healthPath: '/v1/health/liveness',
    },
  },
  database: {
    typeorm: {
      type: 'postgres',
    },
  },
};

const mockExpectReadiness = {
  status: 'ok',
  info: {
    myService: {
      status: 'up',
    },
    typeOrm: {
      status: 'up',
    },
  },
  error: {},
  details: {
    myService: {
      status: 'up',
    },
    typeOrm: {
      status: 'up',
    },
  },
};

const mockExpectReadinessDown = {
  myService: {
    status: 'down',
    message: 'connect ECONNREFUSED 127.0.0.1:8082',
  },
};

describe('Health - Ready controller - extend config', () => {
  let controller: ReadinessController;
  let health: HealthCheckService;
  let http: HttpHealthIndicator;
  let typeOrm: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HttpModule],
      controllers: [ReadinessController],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: mockedConfig,
        },
      ],
    }).compile();

    controller = module.get<ReadinessController>(ReadinessController);
    health = await module.resolve<HealthCheckService>(HealthCheckService);
    http = await module.resolve<HttpHealthIndicator>(HttpHealthIndicator as any);
    typeOrm = await module.resolve<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  });

  it('should be defined with extend config', () => {
    expect(controller).toBeDefined();
  });

  it('should be return up services with extend config', async () => {
    http.pingCheck = jest.fn().mockImplementation(() => mockExpectReadiness.info);
    typeOrm.pingCheck = jest.fn().mockImplementation(() => mockExpectReadiness.info);
    health.check = jest.fn().mockImplementation(() => mockExpectReadiness);
    //controller.check = jest.fn().mockImplementation(() => mockExpectReadiness)

    const readinessData = await controller.check();
    expect(readinessData).toEqual(mockExpectReadiness);
  });
});

const simpleConfig = {
  services: {
    myService: { url: 'http://localhost:8082' },
  },
};

describe('Health - Ready controller - simple config', () => {
  let controller: ReadinessController;
  let health: HealthCheckService;
  let http: HttpHealthIndicator;
  let typeOrm: TypeOrmHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, HttpModule],
      controllers: [ReadinessController],
      providers: [
        {
          provide: CONFIG_OPTIONS,
          useValue: simpleConfig,
        },
      ],
    }).compile();

    controller = module.get<ReadinessController>(ReadinessController);
    health = await module.resolve<HealthCheckService>(HealthCheckService);
    http = await module.resolve<HttpHealthIndicator>(HttpHealthIndicator as any);
    typeOrm = await module.resolve<TypeOrmHealthIndicator>(TypeOrmHealthIndicator);
  });

  it('should be defined with simple config', () => {
    expect(controller).toBeDefined();
  });

  it('should be return up services with simple config', async () => {
    http.pingCheck = jest.fn().mockImplementation(() => mockExpectReadiness.info);
    typeOrm.pingCheck = jest.fn().mockImplementation(() => mockExpectReadiness.info);
    health.check = jest.fn().mockImplementation(() => mockExpectReadiness);

    const readinessData = await controller.check();
    expect(readinessData).toEqual(mockExpectReadiness);
  });
});
