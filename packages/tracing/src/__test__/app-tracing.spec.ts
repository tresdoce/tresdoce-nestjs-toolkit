import { NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import type { IncomingHttpHeaders } from 'node:http';
import { lastValueFrom, of } from 'rxjs';
import type { NodeSDK } from '@opentelemetry/sdk-node';

import { AppModule } from './app/app.module.js';
import { CatsController } from './app/cats/cats.controller.js';
import { CatsService } from './app/cats/cats.service.js';
import { TracingInterceptor } from '../tracing/interceptors/tracing.interceptor.js';
import { otelProvider } from '../tracing/providers/otel.provider.js';
import { TracingService } from '../tracing/services/tracing.service.js';

const configOtel = {
  resourceAttributes: {
    serviceName: 'my-app',
    version: '0.0.1',
    'service.namespace': 'tresdoce',
    'deployment.environment': 'test',
  },
  exporter: {
    url: 'http://localhost:4318/v1/traces',
    timeoutMillis: 500,
  },
};

const createExecutionContext = (
  controller: CatsController,
  handler: (...args: any[]) => any,
  request: Record<string, any>,
  response: Record<string, any>,
) =>
  ({
    switchToHttp: vi.fn(() => ({
      getRequest: vi.fn(() => request),
      getResponse: vi.fn(() => response),
    })),
    getType: vi.fn(() => 'http'),
    getClass: vi.fn(() => CatsController),
    getHandler: vi.fn(() => handler),
    set: vi.fn().mockReturnThis(),
  }) as any;

describe('Tracing', () => {
  let moduleFixture: TestingModule;
  let catsController: CatsController;
  let catsService: CatsService;
  let tracingService: TracingService;
  let configService: ConfigService;
  let interceptor: TracingInterceptor;
  let sdk: NodeSDK | undefined;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        AppModule,
      ],
    }).compile();

    sdk = otelProvider(configOtel);

    catsController = await moduleFixture.resolve<CatsController>(CatsController);
    catsService = await moduleFixture.resolve<CatsService>(CatsService);
    tracingService = await moduleFixture.resolve<TracingService>(TracingService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    interceptor = new TracingInterceptor(tracingService, configService, new Reflector());
  });

  afterAll(async () => {
    await moduleFixture.close();
    // Sin collector local el flush final falla con ECONNREFUSED.
    await sdk?.shutdown().catch(() => undefined);
  });

  it('should be defined', () => {
    expect(catsController).toBeDefined();
    expect(catsService).toBeDefined();
    expect(tracingService).toBeDefined();
    expect(interceptor).toBeDefined();
    expect(sdk).toBeDefined();
  });

  it('should intercept requests and add tracing headers', async () => {
    const request: Record<string, any> = {
      path: '/cats',
      method: 'GET',
      headers: {
        host: 'localhost',
        'tracing-tag': '27',
      },
    };
    const response = {
      statusCode: 200,
      set: vi.fn(),
    };
    const context = createExecutionContext(
      catsController,
      catsController.findAll,
      request,
      response,
    );
    const callHandler = {
      handle: vi.fn(() => of(catsService.findAll())),
    };

    const result = interceptor.intercept(context, callHandler);
    await lastValueFrom(result);

    expect(callHandler.handle).toHaveBeenCalledTimes(1);
    expect(response.set).toHaveBeenCalledWith(expect.any(Object));
    expect(request.span).toBeDefined();
  });

  it('should skip tracing when the route handler is decorated with SkipTrace', async () => {
    const response = {
      statusCode: 200,
      set: vi.fn(),
    };
    const context = createExecutionContext(
      catsController,
      catsController.findOne,
      {
        path: '/cats/1',
        method: 'GET',
        headers: {
          host: 'localhost',
        },
      },
      response,
    );
    const callHandler = {
      handle: vi.fn(() => of(catsService.findOne(1))),
    };

    const result = interceptor.intercept(context, callHandler);
    await lastValueFrom(result);

    expect(callHandler.handle).toHaveBeenCalledTimes(1);
    expect(response.set).not.toHaveBeenCalled();
  });

  it('should expose cats endpoints behavior without opening an HTTP port', async () => {
    await expect(catsController.findAll()).resolves.toEqual(catsService.findAll());
    await expect(catsController.findOne(1)).resolves.toEqual({
      id: 1,
      name: 'nyan',
      age: 2,
    });
    await expect(catsController.findOne(100)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should create spans and tag them from headers', () => {
    const headers: IncomingHttpHeaders = {
      host: 'localhost',
      'tracing-tag': '27',
    };
    const span = tracingService.startActiveSpan(
      '/cats',
      {},
      tracingService.getParentContext(headers),
    );
    const setAttributeSpy = vi.spyOn(span, 'setAttribute');

    tracingService.setSpanContext(headers);
    tracingService.propagateSpanContext(headers);
    tracingService.setSpanTags(span, headers);
    tracingService.setSpanTags(span, {});

    expect(span.spanContext()).toEqual(expect.any(Object));
    expect(setAttributeSpy).toHaveBeenCalledWith('tracing-tag', '27');
    expect(tracingService.generateDuration(Date.now(), Date.now())).toEqual(expect.any(String));
    expect(tracingService.formatDate(Date.now())).toEqual(expect.any(String));

    span.end();
  });
});
