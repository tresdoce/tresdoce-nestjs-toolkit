import type { Mocked } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HttpClientService } from '../http/services/httpClient.service.js';
import { HttpClientInterceptor } from '../http/interceptors/httpClient.interceptor.js';
import { HttpClientModule } from '../http/httpClient.module.js';
import { config } from './utils/index.js';

const mockRequestHeaders = {
  'some-header': 'header-value',
};

const mockRequest = {
  headers: mockRequestHeaders,
};

const executionContext: Mocked<ExecutionContext> = {
  switchToHttp: vi.fn().mockReturnValue({
    getRequest: vi.fn().mockReturnValue(mockRequest),
    getResponse: vi.fn().mockReturnThis(),
    getType: vi.fn().mockReturnThis(),
    getClass: vi.fn().mockReturnThis(),
    getHandler: vi.fn().mockReturnThis(),
  }),
} as any;

const callHandler: Mocked<CallHandler> = {
  handle: vi.fn(),
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

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should be intercept and pass headers', async () => {
    await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toHaveBeenCalledTimes(1);
  });
});
