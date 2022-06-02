import { ResponseInterceptor } from '../response/response.interceptor';
import { JestFN, fixtureUserResponse } from '@tresdoce-nestjs-toolkit/test-utils';
import { of } from 'rxjs';

const executionContext: any = JestFN.executionContext;

describe('ResponseInterceptor', () => {
  let interceptor = new ResponseInterceptor();

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should return an ResponseInterceptor instance simple entity', (done) => {
    const callHandler: any = {
      handle: jest.fn(() => of(fixtureUserResponse)),
    };

    const obs = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);

    obs.subscribe({
      next: (value) => {
        expect(value).toMatchObject(fixtureUserResponse);
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
      handle: jest.fn(() => of([fixtureUserResponse])),
    };
    const obs = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);

    obs.subscribe({
      next: (value) => {
        expect(value).toMatchObject({ data: [fixtureUserResponse] });
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
