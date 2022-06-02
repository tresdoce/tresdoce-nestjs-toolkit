import { ResponseInterceptor } from '../response/response.interceptor';
import { of } from 'rxjs';

const mockResponse: any = {
  id: 1,
  name: 'juan',
  lastname: 'perez',
};

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
};

describe('ResponseInterceptor', () => {
  let interceptor = new ResponseInterceptor();

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should return an ResponseInterceptor instance simple entity', (done) => {
    const callHandler: any = {
      handle: jest.fn(() => of(mockResponse)),
    };

    const obs = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);

    obs.subscribe({
      next: (value) => {
        expect(value).toMatchObject(mockResponse);
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should return an ResponseInterceptor instance multiple entity', (done) => {
    const callHandler: any = {
      handle: jest.fn(() => of([mockResponse])),
    };
    const obs = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);

    obs.subscribe({
      next: (value) => {
        expect(value).toMatchObject({ data: [mockResponse] });
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });
});
