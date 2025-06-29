import { BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import { ExceptionsFilter, PROBLEM_CONTENT_TYPE, IErrorDetail, IProblemDetail } from '../';

const mockJson = jest.fn();

const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));

const mockType = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));

const mockGetResponse = jest.fn().mockImplementation(() => ({
  type: mockType,
  status: mockStatus,
}));

const mockUrl = jest.fn().mockImplementation(() => ({
  url: mockJson,
}));

const mockGetRequest = jest.fn().mockImplementation(() => ({
  type: mockUrl,
}));

const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getResponse: mockGetResponse,
  getRequest: mockGetRequest,
}));

const mockArgumentsHost = {
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

jest.mock('@tresdoce-nestjs-toolkit/core', () => ({
  excludePaths: jest.fn(() => ['/excluded']),
}));

describe('filters', () => {
  describe('code exception', () => {
    const appConfig = config();
    const filter = new ExceptionsFilter(appConfig);

    it('should map a regular code exception', () => {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;
      const expectation: IProblemDetail = {
        message: HttpStatus[status],
        status,
        code: HttpStatus[status],
      };
      try {
        const linea: any = undefined;
        linea.split('');
      } catch (error) {
        filter.catch(error, mockArgumentsHost);
        assertResponse(status, expectation);
      }
    });
  });

  describe('HttpExceptions', () => {
    describe('Default HttpExceptions', () => {
      const appConfig = config();
      const filter = new ExceptionsFilter(appConfig);
      it('should map default exception when thrown with not parameters', () => {
        const status = HttpStatus.BAD_REQUEST;
        const expectation: IProblemDetail = {
          message: HttpStatus[status],
          status,
          code: HttpStatus[status],
        };

        filter.catch(new BadRequestException(), mockArgumentsHost);

        assertResponse(status, expectation);
      });

      it('should map default exception when thrown with error details', () => {
        const status = HttpStatus.FORBIDDEN;
        const message = 'not pass!';

        const expectation: IProblemDetail = {
          message,
          status,
          code: HttpStatus[status],
          detail: HttpStatus[status],
        };
        filter.catch(new ForbiddenException(message), mockArgumentsHost);

        assertResponse(status, expectation);
      });

      it('should map default exception when thrown with error details and description', () => {
        const status = HttpStatus.FORBIDDEN;
        const message = 'passing?';
        const details = 'not pass!';

        const expectation: IProblemDetail = {
          message,
          detail: details,
          status,
          code: HttpStatus[status],
        };
        filter.catch(new ForbiddenException(message, details), mockArgumentsHost);

        assertResponse(status, expectation);
      });

      it('should map HttpException response when called with an object', () => {
        const errorObject: IErrorDetail = {
          message: 'some message',
          error: {
            instance: 'instance',
            type: 'some-problem-detail',
          },
        };

        const status = HttpStatus.BAD_REQUEST;
        const expectation: IProblemDetail = {
          message: errorObject.message,
          detail: errorObject.error,
          status,
          instance: errorObject.error.instance,
          code: HttpStatus[status],
        };

        filter.catch(new HttpException(errorObject, status), mockArgumentsHost);

        assertResponse(status, expectation);
      });
    });

    describe('Generic HttpException', () => {
      const appConfig = config();
      const filter = new ExceptionsFilter(appConfig);

      it('should map HttpException response when called with a string', () => {
        const status = HttpStatus.SEE_OTHER;
        const message = 'Not passing';

        const expectation: IProblemDetail = {
          message,
          status,
          code: HttpStatus[status],
        };

        filter.catch(new HttpException(message, status), mockArgumentsHost);

        assertResponse(status, expectation);
      });

      it('should map HttpException response when called with an object', () => {
        const status = HttpStatus.SEE_OTHER;
        const errorObject: IErrorDetail = {
          message: 'some message',
        };

        const expectation: IProblemDetail = {
          message: errorObject.message,
          status,
          code: HttpStatus[status],
        };

        filter.catch(new HttpException(errorObject, status), mockArgumentsHost);

        assertResponse(status, expectation);
      });

      it('should map HttpException response when called with an object with empty message', () => {
        const status = HttpStatus.SEE_OTHER;
        const errorObject: IErrorDetail = {
          message: '',
        };

        const expectation: IProblemDetail = {
          message: errorObject.message,
          status,
          code: HttpStatus[status],
        };

        filter.catch(new HttpException(errorObject, status), mockArgumentsHost);

        assertResponse(status, expectation);
      });

      it('should map HttpException response when called with an array', () => {
        const status = HttpStatus.SEE_OTHER;
        const errorObject = {
          message: ['some message', 'some message 2'],
          error: 'Bad Request',
        };

        const expectation: IProblemDetail = {
          message: errorObject.error,
          detail: [{ message: errorObject.message[0] }, { message: errorObject.message[1] }],
          status,
          code: HttpStatus[status],
        };

        filter.catch(new HttpException(errorObject, status), mockArgumentsHost);
        assertResponse(status, expectation);
      });
    });
  });

  describe('when used outside a module', () => {
    const appConfig = config();
    const filter = new ExceptionsFilter(appConfig);
    it('should map default exception when thrown with not parameters', () => {
      const status = HttpStatus.BAD_REQUEST;
      const expectation: IProblemDetail = {
        message: HttpStatus[status],
        status,
        code: HttpStatus[status],
      };

      filter.catch(new BadRequestException(), mockArgumentsHost);

      assertResponse(status, expectation);
    });
  });

  describe('configuration is defined with values', () => {
    const appConfig = config();
    const filter = new ExceptionsFilter(appConfig);

    it('should be return application info', async () => {
      expect(appConfig.project.apiPrefix).toEqual('API-TEST');
    });

    const status = HttpStatus.BAD_REQUEST;
    const expectation: IProblemDetail = {
      message: HttpStatus[status],
      status,
      code: HttpStatus[status],
    };

    filter.catch(new BadRequestException(), mockArgumentsHost);

    assertResponse(status, expectation);
  });

  describe('configuration is undefined', () => {
    const appConfig = undefined;
    const filter = new ExceptionsFilter(appConfig);
    const status = HttpStatus.BAD_REQUEST;
    const expectation: IProblemDetail = {
      message: HttpStatus[status],
      status,
      code: HttpStatus[status],
    };

    filter.catch(new BadRequestException(), mockArgumentsHost);
    assertResponse(status, expectation);
  });

  describe('Exclude Paths', () => {
    const appConfig = config();
    const filter = new ExceptionsFilter(appConfig);

    it('should exclude paths correctly', () => {
      mockJson.mockClear();
      mockStatus.mockClear();
      mockType.mockClear();
      mockGetResponse.mockClear();
      mockUrl.mockClear();
      mockGetRequest.mockClear();
      mockHttpArgumentsHost.mockClear();

      mockGetRequest.mockImplementation(() => ({ url: '/excluded' }));

      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      filter.catch(exception, mockArgumentsHost);

      expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith(exception.getResponse());
      expect(mockType).not.toHaveBeenCalled();
    });
  });

  describe('Exclude Paths (non-HttpException)', () => {
    const appConfig = config();
    const filter = new ExceptionsFilter(appConfig);

    it('should exclude paths and skip HttpException branch if error is generic', () => {
      mockJson.mockClear();
      mockStatus.mockClear();
      mockType.mockClear();
      mockGetResponse.mockClear();
      mockUrl.mockClear();
      mockGetRequest.mockClear();
      mockHttpArgumentsHost.mockClear();

      mockGetRequest.mockImplementation(() => ({ url: '/excluded', method: 'GET' }));

      const genericError = new Error('Generic error'); // No es HttpException

      filter.catch(genericError, mockArgumentsHost);

      // Verificamos que NO se haya llamado ni .status ni .json (porque no entró al if interno)
      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockJson).not.toHaveBeenCalled();
      expect(mockType).not.toHaveBeenCalled();
    });
  });
});

function assertResponse(expectedStatus: number, expectedJson: IProblemDetail) {
  expect(mockType).toHaveBeenCalledWith(PROBLEM_CONTENT_TYPE);
  expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
}
