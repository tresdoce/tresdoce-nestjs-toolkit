import { ResponseInterceptor } from '../response/response.interceptor';
import { of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { CallHandler, ExecutionContext } from '@nestjs/common';

const mockConfigService = {
  get: jest.fn(),
};

const mockRequestHeaders = {
  'some-header': 'header-value',
};

const mockRequest = {
  headers: mockRequestHeaders,
};

const mockResponse = {
  setHeader: jest.fn(),
};

const executionContext: jest.Mocked<ExecutionContext> = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnValue(mockResponse),
  }),
} as any;

const callHandler: jest.Mocked<CallHandler> = {
  handle: jest.fn(),
};

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor(mockConfigService as unknown as ConfigService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should not propagate headers if no headers are specified in config', () => {
    mockConfigService.get.mockReturnValue(undefined);
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
  });

  it('should propagate headers from request to response', () => {
    mockConfigService.get.mockReturnValue(['some-header']);
    callHandler.handle.mockReturnValue(of({}));

    interceptor.intercept(executionContext, callHandler).subscribe();

    expect(mockResponse.setHeader).toHaveBeenCalledWith('some-header', 'header-value');
  });

  it('should wrap an array response in a data object', (done) => {
    callHandler.handle.mockReturnValue(of([1, 2, 3]));

    const obs = interceptor.intercept(executionContext, callHandler);
    obs.subscribe((result) => {
      expect(result).toEqual({ data: [1, 2, 3] });
      done();
    });
  });

  it('should not wrap non-array responses', (done) => {
    const responseObject = { key: 'value' };
    callHandler.handle.mockReturnValue(of(responseObject));

    const obs = interceptor.intercept(executionContext, callHandler);
    obs.subscribe((result) => {
      expect(result).toEqual(responseObject);
      done();
    });
  });
});
