import { NotFoundException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import { IncomingHttpHeaders } from 'http';
import { lastValueFrom, of } from 'rxjs';

import { AppModule } from './app/app.module';
import { CatsController } from './app/cats/cats.controller';
import { CatsService } from './app/cats/cats.service';
import { TracingInterceptor } from '../tracing/interceptors/tracing.interceptor';
import { otelProvider } from '../tracing/providers/otel.provider';
import { TracingService } from '../tracing/services/tracing.service';

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

const createExecutionContext = (
  controller: CatsController,
  handler: (...args: any[]) => any,
  request: Record<string, any>,
  response: Record<string, any>,
) =>
  ({
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn(() => request),
      getResponse: jest.fn(() => response),
    })),
    getType: jest.fn(() => 'http'),
    getClass: jest.fn(() => CatsController),
    getHandler: jest.fn(() => handler),
    set: jest.fn().mockReturnThis(),
  }) as any;

describe('Tracing', () => {
  let moduleFixture: TestingModule;
  let catsController: CatsController;
  let catsService: CatsService;
  let tracingService: TracingService;
  let configService: ConfigService;
  let interceptor: TracingInterceptor;

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

    await otelProvider(configOtel);

    catsController = await moduleFixture.resolve<CatsController>(CatsController);
    catsService = await moduleFixture.resolve<CatsService>(CatsService);
    tracingService = await moduleFixture.resolve<TracingService>(TracingService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    interceptor = new TracingInterceptor(tracingService, configService, new Reflector());
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  it('should be defined', () => {
    expect(catsController).toBeDefined();
    expect(catsService).toBeDefined();
    expect(tracingService).toBeDefined();
    expect(interceptor).toBeDefined();
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
      set: jest.fn(),
    };
    const context = createExecutionContext(
      catsController,
      catsController.findAll,
      request,
      response,
    );
    const callHandler = {
      handle: jest.fn(() => of(catsService.findAll())),
    };

    const result = await interceptor.intercept(context, callHandler);
    await lastValueFrom(result as any);

    expect(callHandler.handle).toHaveBeenCalledTimes(1);
    expect(response.set).toHaveBeenCalledWith(expect.any(Object));
    expect(request.span).toBeDefined();
  });

  it('should skip tracing when the route handler is decorated with SkipTrace', async () => {
    const response = {
      statusCode: 200,
      set: jest.fn(),
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
      handle: jest.fn(() => of(catsService.findOne(1))),
    };

    const result = await interceptor.intercept(context, callHandler);
    await lastValueFrom(result as any);

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
    const parentSpanContext = tracingService.getParentSpanOptions(headers);
    const span = tracingService.startActiveSpan('/cats', parentSpanContext);
    const setAttributeSpy = jest.spyOn(span, 'setAttribute');

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
