import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HttpClientService } from '../http/services/httpClient.service';
import { HttpClientInterceptor } from '../http/interceptors/httpClient.interceptor';
import { HttpClientModule } from '../http/httpClient.module';
import { config } from './utils';

const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
};

const callHandler: any = {
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
    await app.init;

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
