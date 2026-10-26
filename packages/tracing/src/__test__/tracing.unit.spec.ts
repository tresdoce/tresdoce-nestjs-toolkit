import { Controller, Get, Logger, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';
import { context, propagation, ROOT_CONTEXT, SpanStatusCode, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { lastValueFrom, of, throwError } from 'rxjs';

import { SkipTrace } from '../tracing/decorators/index.js';
import { TracingInterceptor } from '../tracing/interceptors/tracing.interceptor.js';
import { otelProvider } from '../tracing/providers/otel.provider.js';
import { TracingService } from '../tracing/services/tracing.service.js';
import { DEFAULT_IGNORE_PATHS } from '../tracing/constants/tracing.constant.js';
import {
  buildIgnorePaths,
  createIgnoreIncomingRequestHook,
  isPathIgnored,
} from '../tracing/utils/tracing.util.js';

@Controller('dogs')
class DogsController {
  @Get()
  findAll() {
    return [];
  }
}

@SkipTrace()
@Controller('birds')
class BirdsController {
  @Get()
  findAll() {
    return [];
  }
}

const createSpanMock = () => ({
  setAttributes: vi.fn(),
  setAttribute: vi.fn(),
  addEvent: vi.fn(),
  recordException: vi.fn(),
  setStatus: vi.fn(),
  end: vi.fn(),
});

const createContext = (
  request: Record<string, any>,
  response: Record<string, any>,
  controller: any = DogsController,
  type = 'http',
) =>
  ({
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
    getType: () => type,
    getClass: () => controller,
    getHandler: () => controller.prototype.findAll,
  }) as any;

describe('Tracing - unit', () => {
  const tracingService = new TracingService(new FormatService());

  describe('utils', () => {
    it('should merge default and custom ignore paths without duplicates', () => {
      expect(buildIgnorePaths()).toEqual(DEFAULT_IGNORE_PATHS);
      expect(buildIgnorePaths(['**/private', '**/info'])).toEqual([
        ...DEFAULT_IGNORE_PATHS,
        '**/private',
      ]);
    });

    it('should match paths ignoring the query string', () => {
      const ignorePaths = buildIgnorePaths();
      expect(isPathIgnored('/api/health/liveness?foo=bar', ignorePaths)).toBe(true);
      expect(isPathIgnored('/api/docs/swagger-ui.css', ignorePaths)).toBe(true);
      expect(isPathIgnored('/api/cats', ignorePaths)).toBe(false);
      expect(isPathIgnored(undefined, ignorePaths)).toBe(false);
    });

    it('should build the HttpInstrumentation ignore hook', () => {
      const hook = createIgnoreIncomingRequestHook(buildIgnorePaths());
      expect(hook({ url: '/api/metrics' } as any)).toBe(true);
      expect(hook({ url: '/api/cats' } as any)).toBe(false);
    });
  });

  describe('otelProvider', () => {
    it('should log and return undefined when options are invalid', () => {
      const errorSpy = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      expect(otelProvider(undefined)).toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        'Error creating OpenTelemetry provider',
        expect.any(String),
        'TracingModule',
      );
      errorSpy.mockRestore();
    });

    it('should log non Error values thrown during setup', () => {
      const errorSpy = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      const options = {
        get resourceAttributes() {
          throw 'boom';
        },
      } as any;
      expect(otelProvider(options)).toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(
        'Error creating OpenTelemetry provider',
        'boom',
        'TracingModule',
      );
      errorSpy.mockRestore();
    });
  });

  describe('TracingService', () => {
    it('should use the active context as parent when there is an active span', () => {
      const parent = tracingService.startSpan('parent');
      const activeContext = trace.setSpan(ROOT_CONTEXT, parent);
      const activeSpy = vi.spyOn(context, 'active').mockReturnValue(activeContext);
      expect(tracingService.getParentContext({})).toBe(activeContext);
      activeSpy.mockRestore();
      parent.end();
    });

    it('should extract the parent context from headers when there is no active span', () => {
      propagation.setGlobalPropagator(new W3CTraceContextPropagator());
      const headers = { traceparent: '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01' };
      const parentContext = tracingService.getParentContext(headers);
      expect(trace.getSpanContext(parentContext)?.traceId).toBe('0af7651916cd43dd8448eb211c80319c');
      expect(tracingService.getParentSpanOptions(headers)).toEqual({
        childOf: expect.any(Object),
      });
      propagation.disable();
    });

    it('should not copy sensitive headers as span attributes', () => {
      const span = createSpanMock() as any;
      tracingService.setSpanTags(span, {
        'tracing-tag': '1',
        authorization: 'Bearer secret',
        Cookie: 'sid=1',
        'x-request-id': 'abc',
        'x-forwarded-for': ['1.1.1.1', '2.2.2.2'],
      } as any);
      expect(span.setAttribute).toHaveBeenCalledWith('x-forwarded-for', '1.1.1.1, 2.2.2.2');
      expect(span.setAttribute).toHaveBeenCalledWith('tracing-tag', '1');
      expect(span.setAttribute).toHaveBeenCalledWith('x-request-id', 'abc');
      expect(span.setAttribute).not.toHaveBeenCalledWith('authorization', expect.anything());
      expect(span.setAttribute).not.toHaveBeenCalledWith('Cookie', expect.anything());
      tracingService.setSpanTags(span, undefined);
    });
  });

  describe('TracingInterceptor', () => {
    let span: ReturnType<typeof createSpanMock>;
    let configService: { get: ReturnType<typeof vi.fn> };
    let interceptor: TracingInterceptor;

    beforeEach(() => {
      span = createSpanMock();
      vi.spyOn(tracingService, 'startSpan').mockReturnValue(span as any);
      configService = { get: vi.fn(() => undefined) };
      interceptor = new TracingInterceptor(tracingService, configService as any, new Reflector());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const run = (ctx: any, source$ = of('ok')) => {
      const next = { handle: vi.fn(() => source$) };
      return { next, result: lastValueFrom(interceptor.intercept(ctx, next)) };
    };

    it('should use the host as span name for the root path', async () => {
      const response = { statusCode: 200, set: vi.fn() };
      const { result } = run(
        createContext({ path: '/', method: 'GET', headers: { host: 'localhost:8080' } }, response),
      );
      await expect(result).resolves.toBe('ok');
      expect(tracingService.startSpan).toHaveBeenCalledWith(
        'localhost:8080',
        undefined,
        expect.any(Object),
      );
      expect(span.setAttributes).toHaveBeenLastCalledWith(
        expect.objectContaining({ 'http.status_code': 200 }),
      );
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should skip default and configured ignored paths', async () => {
      configService.get.mockReturnValue(['**/private/**']);
      for (const path of ['/api/health/liveness', '/api/private/data']) {
        const { next, result } = run(
          createContext({ path, method: 'GET', headers: {} }, { set: vi.fn() }),
        );
        await result;
        expect(next.handle).toHaveBeenCalledTimes(1);
      }
      expect(tracingService.startSpan).not.toHaveBeenCalled();
    });

    it('should skip controllers decorated with SkipTrace and non http contexts', async () => {
      await run(createContext({}, {}, BirdsController)).result;
      await run(createContext({}, {}, DogsController, 'rpc')).result;
      expect(tracingService.startSpan).not.toHaveBeenCalled();
    });

    it('should record HttpException errors and end the span', async () => {
      const response = { statusCode: 200, set: vi.fn() };
      const { result } = run(
        createContext({ path: '/dogs/1', method: 'GET', headers: {} }, response),
        throwError(() => new NotFoundException('not found')),
      );
      await expect(result).rejects.toBeInstanceOf(NotFoundException);
      expect(span.recordException).toHaveBeenCalledWith(expect.any(NotFoundException));
      expect(span.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
        message: 'not found',
      });
      expect(span.setAttribute).toHaveBeenCalledWith('error', true);
      expect(span.setAttributes).toHaveBeenLastCalledWith(
        expect.objectContaining({ 'http.status_code': 404 }),
      );
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should record unknown errors as 500', async () => {
      const response = { statusCode: 200, set: vi.fn() };
      const { result } = run(
        createContext({ path: '/dogs', method: 'GET', headers: {} }, response),
        throwError(() => 'boom'),
      );
      await expect(result).rejects.toBe('boom');
      expect(span.recordException).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'boom' }),
      );
      expect(span.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR, message: 'boom' });
      expect(span.setAttributes).toHaveBeenLastCalledWith(
        expect.objectContaining({ 'http.status_code': 500 }),
      );
      expect(span.end).toHaveBeenCalledTimes(1);
    });

    it('should serialize non string errors', async () => {
      const { result } = run(
        createContext({ path: '/dogs', method: 'GET', headers: {} }, { set: vi.fn() }),
        throwError(() => ({ code: 'E_FAIL' })),
      );
      await expect(result).rejects.toEqual({ code: 'E_FAIL' });
      expect(span.setStatus).toHaveBeenCalledWith({
        code: SpanStatusCode.ERROR,
        message: '{"code":"E_FAIL"}',
      });
    });
  });
});
