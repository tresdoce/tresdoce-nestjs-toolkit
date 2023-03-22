import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  dynamicConfig,
  fixtureUserResponse,
  TCElasticSearchOptions,
  tcName,
  testContainers,
} from '@tresdoce-nestjs-toolkit/test-utils';
import { Observable, of, throwError } from 'rxjs';
import { HttpConnection } from '@elastic/elasticsearch';
import { URL } from 'url';

import { ElkModule } from '../elk/elk.module';
import { ElkInterceptor } from '../elk/interceptors/elk.interceptor';
import { ElkService } from '../elk/services/elk.service';

let executionContext: any = {
  switchToHttp: jest.fn(() => ({
    getRequest: () => ({
      path: '/test',
      method: 'GET',
      params: {},
      query: {},
      body: {},
      headers: {
        'Content-Type': 'application/json',
        apiKey: 'abcdefg12345',
      },
    }),
    getResponse: () => ({
      getHeaders: jest.fn().mockReturnValue({
        'Content-Type': 'application/json',
        my_header: 'test-header',
      }),
      json: [fixtureUserResponse],
    }),
  })),
  getType: jest.fn(() => 'http'),
  getClass: jest.fn(() => 'testController'),
  getHandler: jest.fn(() => 'handlerElk'),
};

let executionContextParams: any = {
  switchToHttp: jest.fn(() => ({
    getRequest: () => ({
      path: '/test',
      method: 'GET',
      params: { name: 'juan' },
      query: { name: 'juan' },
      body: { name: 'juan' },
      headers: {
        'Content-Type': 'application/json',
        apiKey: 'abcdefg12345',
      },
    }),
    getResponse: () => ({
      getHeaders: jest.fn().mockReturnValue({
        'Content-Type': 'application/json',
        my_header: 'test-header',
      }),
      json: [fixtureUserResponse],
    }),
  })),
  getType: jest.fn(() => 'http'),
  getClass: jest.fn(() => 'testController'),
  getHandler: jest.fn(() => 'handlerElk'),
};

/*const callHandler: any = {
  handle: jest.fn(() => ({
    pipe: jest.fn(() => ({
      tap: jest.fn(() => ({
        next: jest.fn(),
        error: jest.fn(),
      })),
    })),
  })),
};*/

jest.setTimeout(70000);
describe('ElkModule', () => {
  let app: INestApplication;
  let elkService: ElkService;
  let interceptor: ElkInterceptor<any>;
  let container: testContainers;

  beforeAll(async () => {
    //'elasticsearch:8.3.3'
    //docker.elastic.co/elasticsearch/elasticsearch:8.3.3

    container = await new testContainers('elasticsearch:8.3.3', {
      ...TCElasticSearchOptions,
      containerName: `${tcName}-elasticsearch-interceptor`,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              elasticsearch: {
                name: 'test-elk-index',
                node: {
                  url: new URL(`http://${container.getHost()}:9200`),
                },
                maxRetries: 10,
                requestTimeout: 60000,
                sniffOnStart: true,
                Connection: HttpConnection,
              },
            }),
          ],
        }),
        ElkModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
    app.useGlobalInterceptors(interceptor);
    elkService = moduleFixture.get<ElkService>(ElkService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('ElkInterceptor', () => {
    it('should be an ElkInterceptor instance to be defined', async () => {
      expect(new ElkInterceptor(elkService)).toBeDefined();
    });

    it('should be create document in elasticsearch when return success string', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const callHandler: any = {
        handle: jest.fn(() => of('this is a test')),
      };

      const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
      expect(callHandler.handle).toBeCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, response, false);
          expect(interceptorServiceSpy).toBeCalledWith(
            timeRequest,
            executionContext,
            response,
            false,
          );
        },
        error: () => {},
      });
    });

    it('should be create document in elasticsearch when return success object', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const callHandler: any = {
        handle: jest.fn(() => of([fixtureUserResponse])),
      };

      const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
      expect(callHandler.handle).toBeCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, response, false);
          expect(interceptorServiceSpy).toBeCalledWith(
            timeRequest,
            executionContext,
            response,
            false,
          );
        },
        error: () => {},
      });
    });

    it('should be create document in elasticsearch when return success with parameters', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const callHandler: any = {
        handle: jest.fn(() => of([fixtureUserResponse])),
      };

      const obs: Observable<any> = interceptor.intercept(executionContextParams, callHandler);
      expect(callHandler.handle).toBeCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(
            timeRequest,
            executionContextParams,
            response,
            false,
          );
          expect(interceptorServiceSpy).toBeCalledWith(
            timeRequest,
            executionContextParams,
            response,
            false,
          );
        },
        error: () => {},
      });
    });

    it('should be create document in elasticsearch when return exception', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const error = new Error(`User #$1 not found`);

      const callHandler: any = {
        handle: jest.fn(() => throwError(error)),
      };

      const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
      expect(callHandler.handle).toBeCalledTimes(1);

      obs.subscribe({
        next: () => {},
        error: (error) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, error, true);
          expect(interceptorServiceSpy).toBeCalledWith(timeRequest, executionContext, error, true);
        },
      });
    });

    it('should be create document in elasticsearch when return exception http', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const error = new HttpException('not found', 404);

      const callHandler: any = {
        handle: jest.fn(() => throwError(error)),
      };

      const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
      expect(callHandler.handle).toBeCalledTimes(1);

      obs.subscribe({
        next: () => {},
        error: (error) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, error, true);
          expect(interceptorServiceSpy).toBeCalledWith(timeRequest, executionContext, error, true);
        },
      });
    });
  });

  describe('ElkModule - Register', () => {
    let app: INestApplication;
    let elkService: ElkService;
    let interceptor: ElkInterceptor<any>;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ElkModule.register({
            name: 'test-elk-index',
            node: {
              url: new URL(`http://${container.getHost()}:9200`),
            },
            maxRetries: 10,
            requestTimeout: 60000,
            sniffOnStart: true,
            Connection: HttpConnection,
          }),
        ],
      }).compile();
      app = moduleFixture.createNestApplication();
      interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
      app.useGlobalInterceptors(interceptor);
      elkService = moduleFixture.get<ElkService>(ElkService);
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });
});
