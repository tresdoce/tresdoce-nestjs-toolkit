import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import {
  DEFAULT_API_PREFIX,
  ExceptionsFilter,
  PROBLEM_CONTENT_TYPE,
  IErrorDetail,
  IProblemDetail,
} from '../index.js';

vi.mock('@tresdoce-nestjs-toolkit/core', () => ({
  excludePaths: vi.fn(() => ['/excluded']),
}));

const mockJson = vi.fn((_body: any) => undefined);
const mockStatus = vi.fn((_status: number) => ({ json: mockJson }));
const mockType = vi.fn((_type: string) => ({ status: mockStatus }));

let request: Record<string, unknown>;
let response: Record<string, unknown>;

const mockArgumentsHost = {
  switchToHttp: () => ({
    getResponse: () => response,
    getRequest: () => request,
    getNext: vi.fn(),
  }),
  getArgByIndex: vi.fn(),
  getArgs: vi.fn(),
  getType: vi.fn(),
  switchToRpc: vi.fn(),
  switchToWs: vi.fn(),
} as unknown as ArgumentsHost;

const API_PREFIX = 'API-TEST';

/** What the filter wrote to the response: content type, status and JSON body. */
const sentResponse = () => ({
  contentType: mockType.mock.calls[0]?.[0],
  status: mockStatus.mock.calls[0]?.[0],
  body: mockJson.mock.calls[0]?.[0],
});

const problemResponse = (expected: IProblemDetail) => ({
  contentType: PROBLEM_CONTENT_TYPE,
  status: expected.status,
  body: { error: expected },
});

describe('ExceptionsFilter', () => {
  const appConfig = config();
  const filter = new ExceptionsFilter(appConfig);

  beforeEach(() => {
    vi.clearAllMocks();
    request = { method: 'get', url: '/api/users' };
    response = { type: mockType, status: mockStatus, headersSent: false };
  });

  it('should read the apiPrefix from the app config', () => {
    expect(appConfig.project.apiPrefix).toEqual(API_PREFIX);
  });

  describe('code exception', () => {
    it('should map a regular code exception to a 500', () => {
      try {
        const linea: any = undefined;
        linea.split('');
      } catch (error) {
        filter.catch(error, mockArgumentsHost);
      }
      expect(mockJson).toHaveBeenCalledTimes(1);
      const [[body]] = mockJson.mock.calls;
      expect(body.error).toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        instance: 'GET /api/users',
        code: `${API_PREFIX}-INTERNAL_SERVER_ERROR`,
      });
      expect(typeof body.error.message).toBe('string');
      expect(mockType).toHaveBeenCalledWith(PROBLEM_CONTENT_TYPE);
    });

    it('should use the message of a generic Error', () => {
      filter.catch(new Error('this is an error'), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-INTERNAL_SERVER_ERROR`,
          message: 'this is an error',
          detail: undefined,
        }),
      );
    });

    it('should use a thrown string as message', () => {
      filter.catch('boom', mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-INTERNAL_SERVER_ERROR`,
          message: 'boom',
          detail: undefined,
        }),
      );
    });

    it.each([null, undefined, {}])('should not break when %s is thrown', (thrown) => {
      filter.catch(thrown, mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-INTERNAL_SERVER_ERROR`,
          message: 'Internal Server Error',
          detail: undefined,
        }),
      );
    });
  });

  describe('Default HttpExceptions', () => {
    it('should map default exception when thrown with not parameters', () => {
      filter.catch(new BadRequestException(), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.BAD_REQUEST,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-BAD_REQUEST`,
          message: 'Bad Request',
          detail: undefined,
        }),
      );
    });

    it('should map a NotFoundException with message', () => {
      request = { method: 'GET', url: '/api/users/123456' };
      filter.catch(new NotFoundException('User #123456 not found'), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.NOT_FOUND,
          instance: 'GET /api/users/123456',
          code: `${API_PREFIX}-NOT_FOUND`,
          message: 'User #123456 not found',
          detail: 'Not Found',
        }),
      );
    });

    it('should map default exception when thrown with error details', () => {
      filter.catch(new ForbiddenException('not pass!'), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.FORBIDDEN,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-FORBIDDEN`,
          message: 'not pass!',
          detail: 'Forbidden',
        }),
      );
    });

    it('should map default exception when thrown with error details and description', () => {
      filter.catch(new ForbiddenException('passing?', 'not pass!'), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.FORBIDDEN,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-FORBIDDEN`,
          message: 'passing?',
          detail: 'not pass!',
        }),
      );
    });

    it('should map HttpException response when called with an object', () => {
      const errorObject: IErrorDetail = {
        message: 'some message',
        error: { instance: 'instance', type: 'some-problem-detail' },
      };
      filter.catch(new HttpException(errorObject, HttpStatus.BAD_REQUEST), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.BAD_REQUEST,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-BAD_REQUEST`,
          message: errorObject.message,
          detail: errorObject.error,
        }),
      );
    });

    it('should map validation errors (array of messages) into detail', () => {
      request = { method: 'POST', url: '/api/users' };
      filter.catch(
        new BadRequestException(['firstName must be a string', 'email must be an email']),
        mockArgumentsHost,
      );
      expect(sentResponse()).toEqual(
        problemResponse({
          status: HttpStatus.BAD_REQUEST,
          instance: 'POST /api/users',
          code: `${API_PREFIX}-BAD_REQUEST`,
          message: 'Bad Request',
          detail: [
            { message: 'firstName must be a string' },
            { message: 'email must be an email' },
          ],
        }),
      );
    });
  });

  describe('Generic HttpException', () => {
    const status = HttpStatus.SEE_OTHER;
    const base = { status, instance: 'GET /api/users', code: `${API_PREFIX}-SEE_OTHER` };

    it('should map HttpException response when called with a string', () => {
      filter.catch(new HttpException('Not passing', status), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({ ...base, message: 'Not passing', detail: undefined }),
      );
    });

    it('should map HttpException response when called with an object', () => {
      filter.catch(new HttpException({ message: 'some message' }, status), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({ ...base, message: 'some message', detail: undefined }),
      );
    });

    it('should fallback to the status name when message is empty', () => {
      filter.catch(new HttpException({ message: '' }, status), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({ ...base, message: 'See Other', detail: undefined }),
      );
    });

    it('should map HttpException response when called with an array', () => {
      const errorObject = { message: ['some message', 'some message 2'], error: 'Bad Request' };
      filter.catch(new HttpException(errorObject, status), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          ...base,
          message: 'Bad Request',
          detail: [{ message: 'some message' }, { message: 'some message 2' }],
        }),
      );
    });

    it('should not break when the response body is null', () => {
      filter.catch(new HttpException(null as any, status), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({ ...base, message: 'See Other', detail: undefined }),
      );
    });

    it('should support custom status codes outside the HttpStatus enum', () => {
      filter.catch(new HttpException('Client closed request', 499), mockArgumentsHost);
      expect(sentResponse()).toEqual(
        problemResponse({
          status: 499,
          instance: 'GET /api/users',
          code: `${API_PREFIX}-499`,
          message: 'Client closed request',
          detail: undefined,
        }),
      );
    });
  });

  describe('configuration', () => {
    it.each([undefined, {} as any])(
      'should use the default prefix when the app config is %s',
      (cfg) => {
        new ExceptionsFilter(cfg).catch(new BadRequestException(), mockArgumentsHost);
        expect(sentResponse()).toEqual(
          problemResponse({
            status: HttpStatus.BAD_REQUEST,
            instance: 'GET /api/users',
            code: `${DEFAULT_API_PREFIX}-BAD_REQUEST`,
            message: 'Bad Request',
            detail: undefined,
          }),
        );
      },
    );

    it('should handle a request without url and method', () => {
      request = {};
      filter.catch(new BadRequestException(), mockArgumentsHost);
      expect(mockJson.mock.calls[0][0].error.instance).toBe(' ');
    });
  });

  describe('dependency injection', () => {
    const badRequest = (prefix: string) =>
      problemResponse({
        status: HttpStatus.BAD_REQUEST,
        instance: 'GET /api/users',
        code: `${prefix}-BAD_REQUEST`,
        message: 'Bad Request',
        detail: undefined,
      });

    it('should read the app config from a ConfigService', () => {
      const configService = new ConfigService({ config: config() });
      new ExceptionsFilter(configService).catch(new BadRequestException(), mockArgumentsHost);
      expect(sentResponse()).toEqual(badRequest(API_PREFIX));
    });

    it('should be resolved by Nest DI with ConfigService injected', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true, load: [registerAs('config', () => config())] }),
        ],
        providers: [ExceptionsFilter],
      }).compile();

      moduleRef.get(ExceptionsFilter).catch(new BadRequestException(), mockArgumentsHost);
      expect(sentResponse()).toEqual(badRequest(API_PREFIX));
      await moduleRef.close();
    });

    it('should be resolved by Nest DI without ConfigModule (optional dependency)', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [ExceptionsFilter],
      }).compile();

      moduleRef.get(ExceptionsFilter).catch(new BadRequestException(), mockArgumentsHost);
      expect(sentResponse()).toEqual(badRequest(DEFAULT_API_PREFIX));
      await moduleRef.close();
    });
  });

  describe('headers already sent', () => {
    it('should not write the response', () => {
      response.headersSent = true;
      filter.catch(new BadRequestException(), mockArgumentsHost);
      expect(mockType).not.toHaveBeenCalled();
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
    });
  });

  describe('Exclude Paths', () => {
    it('should return the raw HttpException response on excluded paths', () => {
      request = { method: 'GET', url: '/excluded' };
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith(exception.getResponse());
      expect(mockType).not.toHaveBeenCalled();
    });

    it('should ignore the query string when matching excluded paths', () => {
      request = { method: 'GET', url: '/excluded?verbose=true' };
      filter.catch(new HttpException('Unavailable', 503), mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockJson).toHaveBeenCalledWith('Unavailable');
      expect(mockType).not.toHaveBeenCalled();
    });

    it('should exclude paths and return 500 if error is generic (non-HttpException)', () => {
      request = { method: 'GET', url: '/excluded' };
      filter.catch(new Error('Generic error'), mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(mockType).not.toHaveBeenCalled();
    });
  });
});
