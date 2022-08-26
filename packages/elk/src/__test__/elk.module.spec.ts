import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  dynamicConfig,
  fixtureUserResponse,
  tcName,
  testContainers,
} from '@tresdoce-nestjs-toolkit/test-utils';
import { Observable, of, throwError } from 'rxjs';

import { ElkModule } from '../elk/elk.module';
import { ElkInterceptor } from '../elk/interceptors/elk.interceptor';
import { ElkService } from '../elk/services/elk.service';
import { HttpConnection } from '@elastic/elasticsearch';

const executionContext: any = {
  switchToHttp: jest.fn(() => ({
    getRequest: () => ({
      path: '/test',
      method: 'GET',
      params: {},
      query: {},
      body: {},
    }),
    getResponse: () => [fixtureUserResponse],
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

    container = await new testContainers('docker.elastic.co/elasticsearch/elasticsearch:8.3.3', {
      ports: [
        {
          container: 9200,
          host: 9200,
        },
      ],
      envs: {
        'discovery.type': 'single-node',
        'node.name': 'elasticsearch',
        ES_JAVA_OPTS: '-Xms1g -Xmx1g',
        'xpack.security.enabled': false,
      },
      containerName: `${tcName}-elasticsearch`,
      reuse: true,
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
                node: `http://${container.getHost()}:${container.getMappedPort(9200)}`,
                maxRetries: 5,
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

  it('should be an ElkInterceptor instance to be defined', async () => {
    expect(new ElkInterceptor(elkService)).toBeDefined();
  });

  it('should be create document in elasticsearch when return success', async () => {
    const interceptorSpy = jest.spyOn(interceptor, 'sendDataToElk');
    const timeRequest = Date.now();

    const callHandler: any = {
      handle: jest.fn(() => of([fixtureUserResponse])),
    };

    const obs: Observable<any> = interceptor.intercept(executionContext, callHandler);
    expect(callHandler.handle).toBeCalledTimes(1);

    obs.subscribe({
      next: (response) => {
        interceptor.sendDataToElk(timeRequest, executionContext, response);
        expect(interceptorSpy).toBeCalledWith(timeRequest, executionContext, response);
      },
      error: () => {},
    });
  });

  it('should be create document in elasticsearch when return exception', async () => {
    const interceptorSpy = jest.spyOn(interceptor, 'sendDataToElk');
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
        interceptor.sendDataToElk(timeRequest, executionContext, error, true);
        expect(interceptorSpy).toBeCalledWith(timeRequest, executionContext, error, true);
      },
    });
  });

  it('should be create document in elasticsearch when return exception http', async () => {
    const interceptorSpy = jest.spyOn(interceptor, 'sendDataToElk');
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
        interceptor.sendDataToElk(timeRequest, executionContext, error, true);
        expect(interceptorSpy).toBeCalledWith(timeRequest, executionContext, error, true);
      },
    });
  });
});
