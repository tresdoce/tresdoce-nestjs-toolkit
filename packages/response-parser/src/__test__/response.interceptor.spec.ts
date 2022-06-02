import { ResponseInterceptor } from '../response/response.interceptor';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import { of } from 'rxjs';

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
};

const mockResponse = {
  test: 'Test',
};

describe('ResponseInterceptor', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalInterceptors(new ResponseInterceptor());
    await app.init();
  });

  it('should return an ResponseInterceptor toBeDefined', () => {
    expect(new ResponseInterceptor()).toBeDefined();
  });

  it('should return an ResponseInterceptor instance simple entity', (done) => {
    const interceptor: ResponseInterceptor = new ResponseInterceptor();
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
    const interceptor: ResponseInterceptor = new ResponseInterceptor();
    const callHandler: any = {
      handle: jest.fn(() => of([mockResponse])),
    };
    const obs = interceptor.intercept(executionContext, callHandler);

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
