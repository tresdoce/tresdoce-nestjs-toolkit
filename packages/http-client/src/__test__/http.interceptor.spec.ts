import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HttpClientService } from '../http/services/httpClient.service';
import { HttpClientInterceptor } from '../http/interceptors/httpClient.interceptor';
import { HttpClientModule } from '../http/httpClient.module';
import { config } from './utils';

const mockRequestHeaders = {
  'some-header': 'header-value',
};

const mockRequest = {
  headers: mockRequestHeaders,
};

const executionContext: jest.Mocked<ExecutionContext> = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnThis(),
    getType: jest.fn().mockReturnThis(),
    getClass: jest.fn().mockReturnThis(),
    getHandler: jest.fn().mockReturnThis(),
  }),
} as any;

const callHandler: jest.Mocked<CallHandler> = {
  handle: jest.fn(),
};

describe('HttpInterceptor', () => {
  let app: INestApplication;
  let service: HttpClientService;
  let interceptor: HttpClientInterceptor<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HttpClientModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();

    service = module.get<HttpClientService>(HttpClientService);
    interceptor = new HttpClientInterceptor(service);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should be intercept and pass headers', async () => {
    await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);
  });
});
