import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckService, HttpHealthIndicator, TerminusModule } from '@nestjs/terminus';
import { ReadinessController } from '../lib/controllers/readiness.controller';
import { CONFIG_OPTIONS } from '../lib/constants/helth.constants';

const mockedConfig = {
  services: {
    myService: {
      url: 'http://localhost:8082',
      timeout: 3000,
    },
    demoApi: {
      url: 'https://rudemex-nestjs-starter.herokuapp.com',
      timeout: 3000,
      healthPath: '/liveness',
    },
  },
};

const mockExpectReadiness = {
  status: 'ok',
  info: {
    myService: {
      status: 'up',
    },
  },
  error: {},
  details: {
    myService: {
      status: 'up',
    },
  },
};

describe('Health - Ready controller - extend config', () => {
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
          useValue: mockedConfig,
        },
      ],
    }).compile();

    controller = module.get<ReadinessController>(ReadinessController);
    health = await module.resolve<HealthCheckService>(HealthCheckService);
    http = await module.resolve<HttpHealthIndicator>(HttpHealthIndicator as any);
  });

  it('should be defined with extend config', () => {
    expect(controller).toBeDefined();
  });

  it('should be return up services with extend config', async () => {
    http.pingCheck = jest.fn().mockImplementation(() => mockExpectReadiness.info);
    health.check = jest.fn().mockImplementation(() => mockExpectReadiness);
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
  });

  it('should be defined with simple config', () => {
    expect(controller).toBeDefined();
  });

  it('should be return up services with simple config', async () => {
    http.pingCheck = jest.fn().mockImplementation(() => mockExpectReadiness.info);
    health.check = jest.fn().mockImplementation(() => mockExpectReadiness);

    const readinessData = await controller.check();
    expect(readinessData).toEqual(mockExpectReadiness);
  });
});
