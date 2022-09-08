import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from './app/app.module';
import { otelSDK } from '../tracing/constants/open-telemetry.constants';
import { TracingService } from '../tracing/services/tracing.service';
import { TracingInterceptor } from '../tracing/interceptors/tracing.interceptor';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

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

const mockConfigOtel = {
  serviceName: 'test-otel',
  jaegerConfig: {
    endpoint: `http://localhost:14268/api/traces`,
  },
};

const mockConfigOtelTwo = {
  serviceName: 'test-otel',
  jaegerConfig: {
    host: 'http://localhost',
    port: 14268,
  },
};

const mockConfigOtelThree: Typings.IOpenTelemetryConfiguration = {
  serviceName: 'test-otel',
  jaegerConfig: {},
};

describe('Tracing', () => {
  let app: INestApplication;
  let service: TracingService;
  let interceptor: TracingInterceptor;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await otelSDK(mockConfigOtel).start();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<TracingService>(TracingService);
    interceptor = new TracingInterceptor(service);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(service).toBeDefined();
    expect(new TracingInterceptor(service)).toBeDefined();
  });

  it('should be intercept and pass headers', async () => {
    await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);
  });

  it(`/GET cats`, async () => {
    const req = await request(app.getHttpServer()).get('/cats').send().expect(200);
    const parentSpanContext = service.getParentSpanOptions(req.headers);

    const span = service.startActiveSpan(`${app.getHttpServer()}/cats`, parentSpanContext);
    const spanContext = span.spanContext();
    expect(spanContext).not.toBeNull();
    expect(typeof spanContext).toBe('object');

    service.setSpanTags(span, { ...req.headers, 'tracing-tag': 27 });
  });

  it(`/GET all-cats`, () => {
    return request(app.getHttpServer()).get('/all-cats').expect(404);
  });
});

describe('Tracing - config two', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await otelSDK(mockConfigOtelTwo).start();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`/GET cats`, async () => {
    await request(app.getHttpServer()).get('/cats').send().expect(200);
  });
});

describe('Tracing - config three', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await otelSDK(mockConfigOtelThree).start();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`/GET cats`, async () => {
    await request(app.getHttpServer()).get('/cats').send().expect(200);
  });
});
