import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import request from 'supertest';

import { AppModule } from './app/app.module';
import { TracingService } from '../tracing/services/tracing.service';
import { TracingInterceptor } from '../tracing/interceptors/tracing.interceptor';
import { otelProvider } from '../tracing/providers/otel.provider';

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
};

const callHandler: any = {
  handle: jest.fn(() => ({
    pipe: jest.fn(() => ({
      tap: jest.fn(),
    })),
  })),
};

const configOtel = {
  resourceAttributes: {
    serviceName: 'my-app',
    version: '0.0.1',
    'service.namespace': 'tresdoce',
    'deployment.environment': 'test',
  },
  exporter: {
    url: 'http://localhost:4318/v1/traces',
  },
};

jest.setTimeout(90000);
describe('Tracing', () => {
  let app: INestApplication;
  let tracingService: TracingService;
  let configService: ConfigService;
  let interceptor: TracingInterceptor;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        AppModule,
      ],
    }).compile();

    await otelProvider(configOtel);

    app = moduleFixture.createNestApplication();
    await app.init();

    tracingService = moduleFixture.get<TracingService>(TracingService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    interceptor = new TracingInterceptor(tracingService, configService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(tracingService).toBeDefined();
    expect(new TracingInterceptor(tracingService, configService)).toBeDefined();
  });

  it('should be intercept and pass headers', async () => {
    await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toHaveBeenCalledTimes(1);
  });

  it(`GET /cats`, async () => {
    const req = await request(app.getHttpServer()).get('/cats').send().expect(200);
    const parentSpanContext = tracingService.getParentSpanOptions(req.headers);

    const span = tracingService.startActiveSpan(`${app.getHttpServer()}/cats`, parentSpanContext);
    const spanContext = span.spanContext();
    expect(spanContext).not.toBeNull();
    expect(typeof spanContext).toBe('object');
    tracingService.setSpanTags(span, { ...req.headers, 'tracing-tag': 27 });
  });

  it(`GET /cats/1`, async () => {
    await request(app.getHttpServer()).get('/cats/1').expect(200);
  });

  it(`GET /cats/100`, async () => {
    await request(app.getHttpServer()).get('/cats/100').expect(404);
  });

  it(`GET /all-cats`, async () => {
    await request(app.getHttpServer()).get('/all-cats').expect(404);
  });
});
