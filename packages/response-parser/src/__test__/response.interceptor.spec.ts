import { ResponseInterceptor } from '../lib/interceptors/response.interceptor';

const testInterceptor: any = {
  meta: {
    url: '/test',
    method: 'GET',
    status: 200,
  },
  data: 'mocked data',
  errors: [],
};

const interceptor: ResponseInterceptor<any> = new ResponseInterceptor();

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
};

const callHandler: any = {
  handle: jest.fn(() => ({
    pipe: jest.fn(() => testInterceptor),
  })),
};

describe('ResponseInterceptor', () => {
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should be return response parsed', () => {
    const actualValue = interceptor.intercept(executionContext, callHandler);
    expect(actualValue).toBe(testInterceptor);
    expect(callHandler.handle).toBeCalledTimes(1);
  });
});
