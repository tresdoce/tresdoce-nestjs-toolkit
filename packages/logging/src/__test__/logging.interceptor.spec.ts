import { LoggingService } from '../lib/service/logging.service';
import { LoggingInterceptor } from '../lib/interceptor/logging.interceptor';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '../lib/logging.module';

const mockedManifest = {
  name: 'nestjs-logging',
  version: '1.0.0',
};
const request: any = {
  headers: {},
  path: '/sarasa',
  get: jest.fn().mockReturnThis(),
};
const requestTrace = {
  headers: {
    'uber-trace-id': 'traceId:spanId:spanParentId',
  },
  get: jest.fn().mockReturnThis(),
};

const response: any = {
  headers: {},
  get: jest.fn().mockReturnThis(),
  getHeaders: jest.fn().mockReturnThis(),
};
const body = {};
const executionContext: any = {
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn(),
  getResponse: jest.fn().mockReturnThis(),
  getType: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  getHandler: jest.fn().mockReturnThis(),
};

describe('LoggingInterceptor', () => {
  let loggingService: LoggingService;

  let app: INestApplication;
  const mockedDevConfig = {
    config: {
      server: {
        isProd: false,
        logLevel: 'trace',
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedDevConfig)],
        }),
        LoggingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
  });

  it('should return an LoggingInterceptor toBeDefined', () => {
    expect(new LoggingInterceptor(loggingService)).toBeDefined();
  });

  it('should return an LoggingInterceptor instance', () => {
    const timeRequest = Date.now();
    const requestDuration = Date.now() - timeRequest;

    loggingService.readFile = jest.fn().mockImplementation(() => mockedManifest);
    const interceptor: LoggingInterceptor = new LoggingInterceptor(loggingService);

    const interceptorSpy = jest.spyOn(interceptor, 'logInterceptorResponse');

    const callHandler: any = {
      handle: jest.fn(() => ({
        pipe: jest.fn(() => {
          interceptor.logInterceptorResponse(
            timeRequest,
            executionContext,
            request,
            response,
            body,
          );
          loggingService.addRequestLogs(request, executionContext, timeRequest, requestDuration);
          loggingService.addRequestLogs(
            requestTrace,
            executionContext,
            timeRequest,
            requestDuration,
          );
          loggingService.addResponseLogs(request, response, body, timeRequest, requestDuration);
        }),
      })),
    };
    interceptor.intercept(executionContext, callHandler);

    expect(callHandler.handle).toBeCalledTimes(1);
    expect(interceptorSpy).toBeCalledTimes(1);
  });
});
