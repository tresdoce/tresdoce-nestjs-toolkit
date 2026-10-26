import { LoggingService } from '../logging/service/logging.service.js';
import { LoggingInterceptor } from '../logging/interceptor/logging.interceptor.js';
import { CallHandler, ExecutionContext, HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig, manifest } from '@tresdoce-nestjs-toolkit/test-utils';
import { excludePaths } from '@tresdoce-nestjs-toolkit/core';

import { LoggingModule } from '../logging/logging.module.js';
import { lastValueFrom, Observable, of, throwError } from 'rxjs';
import type { Request, Response } from 'express';

const request = {
  headers: {
    apiKey: '1234567890',
  },
  path: '/sarasa',
  get: vi.fn().mockReturnThis(),
} as unknown as Request;
const requestTrace = {
  headers: {
    'uber-trace-id': 'ef083b253ad4792827d19be437195454:3c5bd7e941c53cfc:0:01',
    'x-amzn-trace-id': 'Root=1-ef083b25-3ad4792827d19be437195454;Parent=3c5bd7e941c53cfc;Sampled=1',
    apiKey: '1234567890',
  },
  get: vi.fn().mockReturnThis(),
} as unknown as Request;

const response = {
  headers: { apiKey: '1234567890' },
  get: vi.fn().mockReturnThis(),
  path: '/sarasa',
  getHeaders: vi.fn().mockReturnThis(),
} as unknown as Response;
const body = {};
const executionContext = {
  switchToHttp: vi.fn().mockReturnThis(),
  getRequest: vi.fn(),
  getResponse: vi.fn().mockReturnThis(),
  getType: vi.fn().mockReturnValue('http'),
  getClass: vi.fn().mockReturnThis(),
  getHandler: vi.fn().mockReturnThis(),
} as unknown as ExecutionContext;

describe('LoggingInterceptor', () => {
  let loggingService: LoggingService;

  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              logger: {
                level: 'trace',
                redact: {
                  paths: ['http_request_headers.apiKey', 'http_response_headers.headers.apiKey'],
                  censor: 'xxx',
                  obfuscateFrom: 'left',
                },
              },
            }),
          ],
        }),
        LoggingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
  });

  it('should return an LoggingInterceptor toBeDefined', () => {
    expect(new LoggingInterceptor(loggingService)).toBeDefined();
  });

  it('should return an LoggingInterceptor instance', () => {
    const timeRequest = Date.now();
    //const requestDuration = Date.now() - timeRequest;

    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    const interceptor: LoggingInterceptor = new LoggingInterceptor(loggingService);

    const interceptorSpy = vi.spyOn(interceptor, 'logInterceptorResponse');

    const callHandler = {
      handle: vi.fn(() => ({
        pipe: vi.fn(() => {
          interceptor.logInterceptorResponse(
            timeRequest,
            executionContext,
            request,
            response,
            body,
            false,
          );
          loggingService.addRequestLogs(request, executionContext, timeRequest);
          loggingService.addRequestLogs(requestTrace, executionContext, timeRequest);
          loggingService.addResponseLogs(
            request,
            response,
            body,
            executionContext,
            timeRequest,
            false,
          );
        }),
      })),
    } as unknown as CallHandler;
    interceptor.intercept(executionContext, callHandler);

    expect(callHandler.handle).toHaveBeenCalledTimes(1);
    expect(interceptorSpy).toHaveBeenCalledTimes(1);

    //expect(interceptor.logInterceptorResponse).toHaveBeenCalledWith(timeRequest, executionContext, request, response, body)
  });

  it('should return an Logging interceptor instance with next handler', async () => {
    const timeRequest = Date.now();
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    const interceptor: LoggingInterceptor = new LoggingInterceptor(loggingService);

    const interceptorSpy = vi.spyOn(interceptor, 'logInterceptorResponse');

    const callHandler: CallHandler = {
      handle: vi.fn(() => of('hola')),
    };

    const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toHaveBeenCalledTimes(1);

    obs.subscribe({
      next: (response: Response) => {
        interceptor.logInterceptorResponse(
          timeRequest,
          executionContext,
          request,
          response,
          body,
          false,
        );
        expect(interceptorSpy).toHaveBeenCalledWith(
          timeRequest,
          executionContext,
          request,
          response,
          body,
          false,
        );
      },
      error: () => {},
    });
  });

  it('should return an Logging interceptor instance with error handler', async () => {
    const timeRequest = Date.now();
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    const interceptor: LoggingInterceptor = new LoggingInterceptor(loggingService);

    const interceptorSpy = vi.spyOn(interceptor, 'logInterceptorResponse');
    const error = new HttpException('not found', 404);
    const callHandler: CallHandler = {
      handle: vi.fn(() => throwError(error)),
    };

    const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toHaveBeenCalledTimes(1);

    obs.subscribe({
      next: () => {},
      error: (error: HttpException) => {
        interceptor.logInterceptorResponse(
          timeRequest,
          executionContext,
          request,
          response,
          error,
          true,
        );
        expect(interceptorSpy).toHaveBeenCalledWith(
          timeRequest,
          executionContext,
          request,
          response,
          error,
          true,
        );
      },
    });
  });

  it('should not log requests to excluded paths (health, docs, etc.)', () => {
    const interceptor = new LoggingInterceptor(loggingService);
    const logSpy = vi.spyOn(loggingService, 'log');
    const excludedRequest = {
      ...request,
      path: `${excludePaths()[0]}/extra`,
    } as unknown as Request;

    interceptor.logInterceptorResponse(
      Date.now(),
      executionContext,
      excludedRequest,
      response,
      body,
      false,
    );

    expect(logSpy).not.toHaveBeenCalled();
  });

  it('should skip non-http contexts (rpc, ws)', () => {
    const interceptor = new LoggingInterceptor(loggingService);
    const spy = vi.spyOn(interceptor, 'logInterceptorResponse');
    const rpcContext = { getType: vi.fn().mockReturnValue('rpc') } as unknown as ExecutionContext;
    const handled = of('data');
    const callHandler: CallHandler = { handle: vi.fn(() => handled) };

    expect(interceptor.intercept(rpcContext, callHandler)).toBe(handled);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should log request and response through the observable pipeline', async () => {
    const interceptor = new LoggingInterceptor(loggingService);
    const spy = vi.spyOn(interceptor, 'logInterceptorResponse').mockImplementation(() => {});
    const ctx = {
      ...executionContext,
      getType: vi.fn().mockReturnValue('http'),
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;

    await lastValueFrom(interceptor.intercept(ctx, { handle: () => of('ok') }));
    expect(spy).toHaveBeenLastCalledWith(expect.any(Number), ctx, request, response, 'ok', false);

    const error = new HttpException('not found', 404);
    await expect(
      lastValueFrom(interceptor.intercept(ctx, { handle: () => throwError(() => error) })),
    ).rejects.toBe(error);
    expect(spy).toHaveBeenLastCalledWith(expect.any(Number), ctx, request, response, error, true);
  });

  it('should never throw when building the logs fails', () => {
    const interceptor = new LoggingInterceptor(loggingService);
    const failure = new Error('cannot serialize');
    vi.spyOn(loggingService, 'addRequestLogs').mockImplementation(() => {
      throw failure;
    });
    const errorSpy = vi.spyOn(loggingService, 'error').mockImplementation(() => {});

    expect(() =>
      interceptor.logInterceptorResponse(
        Date.now(),
        executionContext,
        request,
        response,
        body,
        false,
      ),
    ).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(failure, LoggingInterceptor.name);
  });

  it('should handle requests without path', () => {
    const interceptor = new LoggingInterceptor(loggingService);
    const logSpy = vi.spyOn(loggingService, 'log').mockImplementation(() => {});
    const noPathRequest = { ...request, path: undefined } as unknown as Request;

    interceptor.logInterceptorResponse(
      Date.now(),
      executionContext,
      noPathRequest,
      response,
      body,
      false,
    );
    expect(logSpy).toHaveBeenCalledTimes(2);
  });
});
