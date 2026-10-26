import type { Mocked } from 'vitest';
import { ResponseInterceptor } from '../response/response.interceptor.js';
import { of, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CallHandler, ExecutionContext } from '@nestjs/common';

const mockConfigService = {
  get: vi.fn(),
};

const mockRequestHeaders = {
  'some-header': 'header-value',
  'x-multi': ['a', 'b'],
  'x-empty': '',
};

const mockRequest = {
  headers: mockRequestHeaders,
};

const mockResponse = {
  setHeader: vi.fn(),
};

const executionContext: Mocked<ExecutionContext> = {
  getType: vi.fn().mockReturnValue('http'),
  switchToHttp: vi.fn().mockReturnValue({
    getRequest: vi.fn().mockReturnValue(mockRequest),
    getResponse: vi.fn().mockReturnValue(mockResponse),
  }),
} as any;

const callHandler: Mocked<CallHandler> = {
  handle: vi.fn(),
};

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor(mockConfigService as unknown as ConfigService);
    vi.clearAllMocks();
    executionContext.getType.mockReturnValue('http');
    mockConfigService.get.mockReturnValue(undefined);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should not propagate headers if no headers are specified in config', () => {
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockConfigService.get).toHaveBeenCalledWith('config.server.propagateHeaders');
    expect(executionContext.switchToHttp).not.toHaveBeenCalled();
    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should propagate headers from request to response', () => {
    mockConfigService.get.mockReturnValue(['some-header']);
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).toHaveBeenCalledWith('some-header', 'header-value');
  });

  it('should normalize header names (trim + lowercase) and keep multi-value headers', () => {
    mockConfigService.get.mockReturnValue([' Some-Header ', 'X-Multi']);
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).toHaveBeenCalledWith('some-header', 'header-value');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('x-multi', ['a', 'b']);
  });

  it('should accept a comma separated string as propagateHeaders', () => {
    mockConfigService.get.mockReturnValue('some-header, x-multi');
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).toHaveBeenCalledTimes(2);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('x-multi', ['a', 'b']);
  });

  it('should ignore empty header names and empty header values', () => {
    mockConfigService.get.mockReturnValue(['', '  ', 'x-empty']);
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should ignore invalid propagateHeaders config', () => {
    mockConfigService.get.mockReturnValue({ foo: 'bar' });
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should skip header propagation in non-http contexts', async () => {
    executionContext.getType.mockReturnValue('rpc');
    mockConfigService.get.mockReturnValue(['some-header']);
    callHandler.handle.mockReturnValue(of([1]));

    const result = await firstValueFrom(interceptor.intercept(executionContext, callHandler));

    expect(result).toEqual({ data: [1] });
    expect(mockConfigService.get).not.toHaveBeenCalled();
    expect(executionContext.switchToHttp).not.toHaveBeenCalled();
    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should wrap an array response in a data object', async () => {
    callHandler.handle.mockReturnValue(of([1, 2, 3]));

    const result = await firstValueFrom(interceptor.intercept(executionContext, callHandler));
    expect(result).toEqual({ data: [1, 2, 3] });
  });

  it('should not wrap non-array responses', async () => {
    const responseObject = { key: 'value' };
    callHandler.handle.mockReturnValue(of(responseObject));

    const result = await firstValueFrom(interceptor.intercept(executionContext, callHandler));
    expect(result).toEqual(responseObject);
  });

  it.each([null, undefined, 'text', 0])('should pass %s through unchanged', async (value) => {
    callHandler.handle.mockReturnValue(of(value));

    const result = await firstValueFrom(interceptor.intercept(executionContext, callHandler));
    expect(result).toBe(value);
  });

  it('should skip setting header if request does not contain it', () => {
    mockConfigService.get.mockReturnValue(['missing-header']);
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });
});
