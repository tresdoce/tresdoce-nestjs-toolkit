import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { LoggingModule } from '@tresdoce-nestjs-toolkit/logging';
import { HttpClientService } from '../lib/services/http.service';
import { HttpClientInterceptor } from '../lib/interceptors/http.interceptor';
import { HttpClientModule } from '../lib/http.module';
import { config } from './utils';

let service: HttpClientService;

let interceptor: HttpClientInterceptor<any>;
const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn().mockReturnThis(),
  getResponse: jest.fn().mockReturnThis(),
};

const callHandler: any = {
  handle: jest.fn(),
};

describe('HttpClientInterceptor', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        LoggingModule,
        HttpClientModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
    service = module.get<HttpClientService>(HttpClientService);
    interceptor = new HttpClientInterceptor(service);
  });

  it('should be defined', () => {
    expect(new HttpClientInterceptor(service)).toBeDefined();
  });

  it('should be intercept and pass headers', async () => {
    const actualValue = await interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);
  });
});
