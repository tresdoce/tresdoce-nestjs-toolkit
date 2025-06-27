import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config, dynamicConfig, fixtureUserResponse } from '@tresdoce-nestjs-toolkit/test-utils';
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

const elkIndexName = `test-elasticsearch`;

jest.setTimeout(90000);
describe('ElkInterceptor', () => {
  let app: INestApplication;
  let elkService: ElkService;
  let interceptor: ElkInterceptor<any>;

  describe('With indexDate', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                elasticsearch: {
                  name: `${elkIndexName}`,
                  indexDate: true,
                  node: {
                    url: new URL(`http://localhost:9200`),
                  },
                  redact: {
                    paths: ['headers.request.apiKey'],
                    censor: 'XXXX',
                  },
                  maxRetries: 10,
                  requestTimeout: 90000,
                  sniffOnStart: false,
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

    it('should be an ElkInterceptor instance to be defined', async () => {
      expect(new ElkInterceptor(elkService)).toBeDefined();
    });

    it('should be return client ref', async () => {
      const clientRef = elkService.clientRef;
      expect(clientRef).toBeDefined();
      expect(clientRef.name).toEqual(`${elkIndexName}`);
    });

    it('should be create document in elasticsearch when return success string', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const callHandler: any = {
        handle: jest.fn(() => of('this is a test')),
      };

      const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, response, false);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, response, false);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(
            timeRequest,
            executionContextParams,
            response,
            false,
          );
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: () => {},
        error: (error) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, error, true);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
            timeRequest,
            executionContext,
            error,
            true,
          );
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: () => {},
        error: (error) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, error, true);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
            timeRequest,
            executionContext,
            error,
            true,
          );
        },
      });
    });

    it('should skip logging if path is in excludePaths', async () => {
      const spyCreateIndex = jest.spyOn(elkService as any, 'createIndexDocument');
      const spyRedact = jest.spyOn(elkService as any, 'redactElkDocument');

      const executionContextExcluded: any = {
        ...executionContext,
        switchToHttp: () => ({
          getRequest: () => ({
            path: '/info',
            method: 'GET',
            params: {},
            query: {},
            body: {},
            headers: {},
            cookies: {},
          }),
          getResponse: () => ({
            getHeaders: jest.fn(() => ({})),
            statusCode: 200,
          }),
        }),
      };

      const response = { ok: true };
      const timeRequest = Date.now();

      await elkService.serializeResponseInterceptor(
        timeRequest,
        executionContextExcluded,
        response,
        false,
      );

      expect(spyCreateIndex).not.toHaveBeenCalled();
      expect(spyRedact).not.toHaveBeenCalled();
    });
  });

  describe('Without indexDate', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                elasticsearch: {
                  name: `${elkIndexName}`,
                  indexDate: false,
                  node: {
                    url: new URL(`http://localhost:9200`),
                  },
                  redact: {
                    paths: ['headers.request.apiKey'],
                    censor: 'XXXX',
                  },
                  maxRetries: 10,
                  requestTimeout: 90000,
                  sniffOnStart: false,
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

    it('should be an ElkInterceptor instance to be defined', async () => {
      expect(new ElkInterceptor(elkService)).toBeDefined();
    });

    it('should be return client ref', async () => {
      const clientRef = elkService.clientRef;
      expect(clientRef).toBeDefined();
      expect(clientRef.name).toEqual(`${elkIndexName}`);
    });

    it('should be create document in elasticsearch when return success string', async () => {
      const interceptorServiceSpy = jest.spyOn(elkService, 'serializeResponseInterceptor');
      const timeRequest = Date.now();

      const callHandler: any = {
        handle: jest.fn(() => of('this is a test')),
      };

      const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, response, false);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, response, false);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: (response) => {
          elkService.serializeResponseInterceptor(
            timeRequest,
            executionContextParams,
            response,
            false,
          );
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: () => {},
        error: (error) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, error, true);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
            timeRequest,
            executionContext,
            error,
            true,
          );
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
      expect(callHandler.handle).toHaveBeenCalledTimes(1);

      obs.subscribe({
        next: () => {},
        error: (error) => {
          elkService.serializeResponseInterceptor(timeRequest, executionContext, error, true);
          expect(interceptorServiceSpy).toHaveBeenCalledWith(
            timeRequest,
            executionContext,
            error,
            true,
          );
        },
      });
    });

    it('should skip logging if path is in excludePaths', async () => {
      const spyCreateIndex = jest.spyOn(elkService as any, 'createIndexDocument');
      const spyRedact = jest.spyOn(elkService as any, 'redactElkDocument');

      const executionContextExcluded: any = {
        ...executionContext,
        switchToHttp: () => ({
          getRequest: () => ({
            path: '/info',
            method: 'GET',
            params: {},
            query: {},
            body: {},
            headers: {},
            cookies: {},
          }),
          getResponse: () => ({
            getHeaders: jest.fn(() => ({})),
            statusCode: 200,
          }),
        }),
      };

      const response = { ok: true };
      const timeRequest = Date.now();

      await elkService.serializeResponseInterceptor(
        timeRequest,
        executionContextExcluded,
        response,
        false,
      );

      expect(spyCreateIndex).not.toHaveBeenCalled();
      expect(spyRedact).not.toHaveBeenCalled();
    });
  });
});
