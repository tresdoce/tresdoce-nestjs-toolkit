import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import ClientMock from '@elastic/elasticsearch-mock';

import { ElkModule } from '../elk/elk.module';
import { ElkInterceptor } from '../elk/interceptors/elk.interceptor';
import { ElkService } from '../elk/services/elk.service';

const mockElk = new ClientMock();

const body = {};
const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
};
const request: any = {
  headers: {},
  path: '/sarasa',
  get: jest.fn().mockReturnThis(),
};
const response: any = {
  get: jest.fn().mockReturnThis(),
  query: {},
  params: {},
};

jest.setTimeout(70000);
describe('ElkModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              elasticsearch: {
                name: 'test-elk-index',
                node: 'http://localhost:9200',
                maxRetries: 10,
                requestTimeout: 60000,
                Connection: mockElk.getConnection(),
              },
            }),
          ],
        }),
        ElkModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalInterceptors(new ElkInterceptor(app.get<ElkService>(ElkService)));
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should be an ElkInterceptor instance to be defined', async () => {
    expect(new ElkInterceptor(app.get<ElkService>(ElkService))).toBeDefined();
  });

  /*it('should be create document in elasticsearch', async () => {
      const interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
      const interceptorSpy = jest.spyOn(interceptor, 'sendDataToElk');
      const timeRequest = Date.now();
      const requestDuration = Date.now() - timeRequest;

      const callHandler: any = {
        handle: jest.fn(() => ({
          pipe: jest.fn(() => {
            interceptor.sendDataToElk(timeRequest, executionContext, response);
          }),
        })),
      };
      interceptor.intercept(executionContext, callHandler);

      expect(callHandler.handle).toBeCalledTimes(1);
      expect(interceptorSpy).toBeCalledTimes(1);
    });*/
});
