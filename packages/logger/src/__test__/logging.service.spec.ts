import { ExecutionContext, INestApplication, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { config, dynamicConfig, manifest } from '@tresdoce-nestjs-toolkit/test-utils';
import type { Request, Response } from 'express';

import { LoggingModule } from '../logging/logging.module.js';
import { LoggingService } from '../logging/service/logging.service.js';

describe('LoggingService development', () => {
  let loggingService: LoggingService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        LoggingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
  });

  it('should be read package file', () => {
    const packageFile = loggingService.readFile<{ name: string; version: string }>(
      import.meta.dirname,
      '../../package.json',
    );
    expect(packageFile).toBeDefined();
    expect(packageFile).toEqual(expect.any(Object));
  });

  it('should be defined', () => {
    expect(loggingService).toBeInstanceOf(LoggingService);
  });

  it('Should return a GenericLog object', () => {
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    expect(loggingService.getGenericLog('info')).toHaveProperty('log_level');
  });

  it('Should return a GenericLog object with timestamp', () => {
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    expect(loggingService.getGenericLog('info', 'DEFAULT', 25451233144)).toHaveProperty(
      'log_level',
    );
  });

  it('Should log a simply info level message with genericLog', () => {
    const spy = vi.spyOn(loggingService, 'log');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    const log = loggingService.getGenericLog('info');
    log['message'] = 'Log a simply info level message with genericLog';
    loggingService.log(log);
    expect(spy).toHaveBeenCalledWith(log);
  });

  it('Should log a simply info level message with with genericLog and context', () => {
    const spy = vi.spyOn(loggingService, 'log');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    const log = loggingService.getGenericLog('info');
    log['message'] = 'Log a simply info level message with genericLog';
    loggingService.log(log, 'this is a context');
    expect(spy).toHaveBeenCalledWith(log, 'this is a context');
  });

  it('Should log a simply info level message', () => {
    const spy = vi.spyOn(loggingService, 'log');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.log('Log a simply info level message');
    expect(spy).toHaveBeenCalledWith('Log a simply info level message');
  });

  it('Should log a simply info level message with context', () => {
    const spy = vi.spyOn(loggingService, 'log');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.log('Log a simply info level message', 'this is a context');
    expect(spy).toHaveBeenCalledWith('Log a simply info level message', 'this is a context');
  });

  it('Should log a simply info level message in obj', () => {
    const spy = vi.spyOn(loggingService, 'log');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.log({ res: 'Log a simply info level message' });
    expect(spy).toHaveBeenCalledWith({ res: 'Log a simply info level message' });
  });

  it('Should log a simply info level message in obj with context', () => {
    const spy = vi.spyOn(loggingService, 'log');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.log({ res: 'Log a simply info level message' }, 'this is a context');
    expect(spy).toHaveBeenCalledWith(
      { res: 'Log a simply info level message' },
      'this is a context',
    );
  });

  it('Should log info level message', () => {
    const spy = vi.spyOn(loggingService, 'info');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.info('Log info level message');
    expect(spy).toHaveBeenCalledWith('Log info level message');
  });

  it('Should log info level message with context', () => {
    const spy = vi.spyOn(loggingService, 'info');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.info('Log info level message', 'Context log info level');
    expect(spy).toHaveBeenCalledWith('Log info level message', 'Context log info level');
  });

  it('Should log error level message stack trace', () => {
    const spy = vi.spyOn(loggingService, 'error');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.error(new Error('Log error stack trace'));
    expect(spy).toHaveBeenCalledWith(new Error('Log error stack trace'));
  });

  it('Should log error level message', () => {
    const spy = vi.spyOn(loggingService, 'error');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.error('Log error level message');
    expect(spy).toHaveBeenCalledWith('Log error level message');
  });

  it('Should log error level message with context', () => {
    const spy = vi.spyOn(loggingService, 'error');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.error('Log error level message', 'Context log error level');
    expect(spy).toHaveBeenCalledWith('Log error level message', 'Context log error level');
  });

  it('Should log warn level message', () => {
    const spy = vi.spyOn(loggingService, 'warn');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.warn('Log warn level message');
    expect(spy).toHaveBeenCalledWith('Log warn level message');
  });

  it('Should log warn level message with context', () => {
    const spy = vi.spyOn(loggingService, 'warn');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.warn('Log warn level message', 'Context log warn level');
    expect(spy).toHaveBeenCalledWith('Log warn level message', 'Context log warn level');
  });

  it('Should log fatal level message', () => {
    const spy = vi.spyOn(loggingService, 'fatal');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.fatal('Log fatal level message');
    expect(spy).toHaveBeenCalledWith('Log fatal level message');
  });

  it('Should log fatal level message with context', () => {
    const spy = vi.spyOn(loggingService, 'fatal');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.fatal('Log fatal level message', 'Context log fatal level');
    expect(spy).toHaveBeenCalledWith('Log fatal level message', 'Context log fatal level');
  });

  it('Should log debug level message', () => {
    const spy = vi.spyOn(loggingService, 'debug');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.debug('Log debug level message');
    expect(spy).toHaveBeenCalledWith('Log debug level message');
  });

  it('Should log debug level message with context', () => {
    const spy = vi.spyOn(loggingService, 'debug');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.debug('Log debug level message', 'Context log debug level');
    expect(spy).toHaveBeenCalledWith('Log debug level message', 'Context log debug level');
  });

  it('Should log trace level message', () => {
    const spy = vi.spyOn(loggingService, 'trace');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.trace('Log trace level message');
    expect(spy).toHaveBeenCalledWith('Log trace level message');
  });

  it('Should log trace level message with context', () => {
    const spy = vi.spyOn(loggingService, 'trace');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.trace('Log trace level message', 'Context log trace level');
    expect(spy).toHaveBeenCalledWith('Log trace level message', 'Context log trace level');
  });

  it('Should log silent level message', () => {
    const spy = vi.spyOn(loggingService, 'silent');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.silent('Log silent level message');
    expect(spy).toHaveBeenCalledWith('Log silent level message');
  });

  it('Should log silent level message with context', () => {
    const spy = vi.spyOn(loggingService, 'silent');
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    loggingService.silent('Log silent level message', 'Context log silent level');
    expect(spy).toHaveBeenCalledWith('Log silent level message', 'Context log silent level');
  });
});

vi.setConfig({ testTimeout: 90000 });
describe('LoggingService prod', () => {
  let loggingService: LoggingService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              ...config(),
              server: {
                ...config().server,
                isProd: true,
              },
              logger: {
                ...config().logger,
                level: 'trace',
              },
            }),
          ],
        }),
        LoggingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
  });

  it('should be defined', () => {
    expect(loggingService).toBeInstanceOf(LoggingService);
  });

  it('should stringify a non-string primitive message via toString', () => {
    expect(() => loggingService.log(123)).not.toThrow();
    expect(() => loggingService.log(true)).not.toThrow();
  });

  it('should format an undefined message', () => {
    expect(() => loggingService.log(undefined)).not.toThrow();
  });

  it('should format a null message', () => {
    expect(() => loggingService.log(null)).not.toThrow();
  });
});

describe('LoggingService excludeContentType', () => {
  let loggingService: LoggingService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              logger: {
                excludeContentType: ['text/html'],
              },
            }),
          ],
        }),
        LoggingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
  });

  it('should exclude the response body when its content-type is configured to be excluded', () => {
    const request = { headers: {}, get: vi.fn().mockReturnThis() } as unknown as Request;
    const response = {
      statusCode: 200,
      getHeaders: vi.fn().mockReturnValue({ 'content-type': 'text/html' }),
    } as unknown as Response;
    const context = {
      getClass: vi.fn().mockReturnValue({ name: 'TestController' }),
      getHandler: vi.fn().mockReturnValue({ name: 'testHandler' }),
      getType: vi.fn().mockReturnValue('http'),
    } as unknown as ExecutionContext;

    const responseLog = loggingService.addResponseLogs(
      request,
      response,
      { some: 'body' },
      context,
      Date.now(),
      false,
    );

    expect(responseLog.http_response_body).toBe(
      JSON.stringify('The response body was excluded because of the content-type: text/html'),
    );
  });
});

describe('LoggingService as Nest logger (prod output)', () => {
  let loggingService: LoggingService;
  let app: INestApplication;
  let writeSpy: ReturnType<typeof vi.spyOn>;

  const lastLine = (): Record<string, unknown> => {
    const calls = writeSpy.mock.calls;
    return JSON.parse(String(calls[calls.length - 1][0]));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              logger: {
                level: 'trace',
                redact: { paths: ['http_request_headers.authorization'] },
              },
            }),
          ],
        }),
        LoggingModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(async () => {
    writeSpy.mockRestore();
    await app.close();
  });

  it('should honor the configured level (debug/trace are written)', () => {
    loggingService.debug('debug message');
    expect(lastLine()).toMatchObject({ level: 20, log_level: 'DEBUG', message: 'debug message' });
    loggingService.trace('trace message', 'Ctx');
    expect(lastLine()).toMatchObject({ level: 10, context: 'Ctx', message: 'trace message' });
  });

  it('should map verbose to trace', () => {
    loggingService.verbose('verbose message', 'Ctx');
    expect(lastLine()).toMatchObject({ level: 10, log_level: 'TRACE', context: 'Ctx' });
  });

  it('should use the trailing string param as context (Nest Logger convention)', () => {
    loggingService.log('message', { extra: true }, 'NestFactory');
    expect(lastLine()).toMatchObject({ context: 'NestFactory', message: 'message' });
  });

  it('should support the Nest error(message, stack, context) signature', () => {
    const stack = 'Error: boom\n    at foo (file.js:1:1)';
    loggingService.error('boom', stack, 'ExceptionsHandler');
    expect(lastLine()).toMatchObject({ context: 'ExceptionsHandler', message: 'boom', stack });
  });

  it('should support error(message, undefined, context) sent by a contextual Logger', () => {
    loggingService.error('boom', undefined, 'MyService');
    const line = lastLine();
    expect(line).toMatchObject({ context: 'MyService', message: 'boom' });
    expect(line).not.toHaveProperty('stack');
  });

  it('should detect a single stack-formatted param as stack', () => {
    const stack = 'Error: boom\n    at foo (file.js:1:1)';
    loggingService.error('boom', stack);
    const line = lastLine();
    expect(line).toMatchObject({ message: 'boom', stack });
    expect(line).not.toHaveProperty('context');
  });

  it('should serialize Error instances with message and stack', () => {
    const error = new Error('exploded');
    loggingService.error(error);
    expect(lastLine()).toMatchObject({ message: 'exploded', stack: error.stack });
    loggingService.fatal(error, 'Ctx');
    expect(lastLine()).toMatchObject({ level: 60, context: 'Ctx', message: 'exploded' });
  });

  it('should keep REQUEST/RESPONSE logs as top-level fields and redact them', () => {
    const request = {
      headers: { authorization: 'Bearer 1234567890' },
      path: '/v1/users',
      method: 'GET',
      protocol: 'http',
      query: {},
      ip: '::1',
      get: vi.fn().mockReturnValue('localhost:8080'),
    } as unknown as Request;
    const context = {
      getClass: vi.fn().mockReturnValue({ name: 'UsersController' }),
      getHandler: vi.fn().mockReturnValue({ name: 'findAll' }),
      getType: vi.fn().mockReturnValue('http'),
    } as unknown as ExecutionContext;
    loggingService.log(loggingService.addRequestLogs(request, context, Date.now()));
    const line = lastLine();
    expect(line).toMatchObject({
      log_type: 'REQUEST',
      http_request_method: 'GET',
      http_request_address: 'http://localhost:8080/v1/users',
    });
    expect(JSON.parse(line.http_request_headers as string).authorization).toBe('Bearer 123456****');
  });
});

describe('LoggingService exception responses', () => {
  let loggingService: LoggingService;
  let app: INestApplication;
  const request = { headers: {}, get: vi.fn() } as unknown as Request;
  const response = { getHeaders: vi.fn().mockReturnValue({}) } as unknown as Response;
  const context = {
    getClass: vi.fn().mockReturnValue({ name: 'TestController' }),
    getHandler: vi.fn().mockReturnValue({ name: 'testHandler' }),
    getType: vi.fn().mockReturnValue('http'),
  } as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, load: [config] }), LoggingModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    loggingService = module.get<LoggingService>(LoggingService);
    loggingService.readFile = vi.fn().mockImplementation(() => manifest);
  });

  const respond = (error: unknown) =>
    loggingService.addResponseLogs(request, response, error, context, Date.now(), true);

  it('should use status and response of an HttpException', () => {
    const log = respond(new NotFoundException('User not found'));
    expect(log.http_response_status_code).toBe(404);
    expect(log.http_response_status_phrase).toBe('NOT_FOUND');
    expect(JSON.parse(log.http_response_body as string)).toEqual({
      message: 'User not found',
      error: 'Not Found',
      statusCode: 404,
    });
  });

  it('should default to 500 and serialize name/message of a generic Error', () => {
    const log = respond(new TypeError('boom'));
    expect(log.http_response_status_code).toBe(500);
    expect(JSON.parse(log.http_response_body as string)).toEqual({
      name: 'TypeError',
      message: 'boom',
    });
  });

  it('should read numeric status/statusCode from plain error objects', () => {
    expect(respond({ status: 409 }).http_response_status_code).toBe(409);
    expect(respond({ statusCode: 401 }).http_response_status_code).toBe(401);
    expect(respond(undefined).http_response_status_code).toBe(500);
  });
});

describe('LoggingService application info', () => {
  const service = new LoggingService(undefined, undefined);
  const reset = () => {
    (LoggingService as unknown as { appPackageJson?: unknown }).appPackageJson = undefined;
  };

  afterEach(() => {
    vi.unstubAllEnvs();
    reset();
  });

  it('should read application name/version from npm env vars', () => {
    reset();
    vi.stubEnv('npm_package_name', 'my-app');
    vi.stubEnv('npm_package_version', '1.2.3');
    expect(service.getGenericLog('info')).toMatchObject({
      application_name: 'my-app',
      application_version: '1.2.3',
    });
  });

  it('should fall back to the package.json of the working directory', () => {
    reset();
    vi.stubEnv('npm_package_name', '');
    vi.stubEnv('npm_package_version', '');
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(import.meta.dirname + '/../..');
    expect(service.getGenericLog('info').application_name).toBe('@tresdoce-nestjs-toolkit/logger');
    cwdSpy.mockRestore();
  });

  it('should leave the application info undefined when no package.json is found', () => {
    reset();
    vi.stubEnv('npm_package_name', '');
    vi.stubEnv('npm_package_version', '');
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue('/nonexistent-dir');
    expect(service.getGenericLog('info').application_version).toBeFalsy();
    cwdSpy.mockRestore();
  });
});
