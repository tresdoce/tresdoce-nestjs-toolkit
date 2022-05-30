import { BadRequestException, ForbiddenException, HttpException, HttpStatus } from '@nestjs/common';
import {
  ExceptionsFilter,
  defaultHttpErrors,
  PROBLEM_CONTENT_TYPE,
  IErrorDetail,
  IProblemDetail,
} from '../';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

const mockJson = jest.fn();

const mockStatus = jest.fn().mockImplementation(() => ({
  json: mockJson,
}));

const mockType = jest.fn().mockImplementation(() => ({
  status: mockStatus,
}));

const mockGetResponse = jest.fn().mockImplementation(() => ({
  type: mockType,
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

describe('default Http exceptions', () => {
  const appConfig = config();
  const filter: ExceptionsFilter = new ExceptionsFilter(appConfig);
  it('should map default exception when thrown with not parameters', () => {
    const status = HttpStatus.BAD_REQUEST;
    const expectation: IProblemDetail = {
      title: defaultHttpErrors[status],
      status,
      type: defaultHttpErrors[status],
    };

    filter.catch(new BadRequestException(), mockArgumentsHost);

    assertResponse(status, expectation);
  });

  it('should map default exception when thrown with error details', () => {
    const status = HttpStatus.FORBIDDEN;
    const title = 'not pass!';

    const expectation: IProblemDetail = {
      title,
      status,
      type: defaultHttpErrors[status],
      detail: defaultHttpErrors[status],
    };
    filter.catch(new ForbiddenException(title), mockArgumentsHost);

    assertResponse(status, expectation);
  });

  it('should map default exception when thrown with error details and description', () => {
    const status = HttpStatus.FORBIDDEN;
    const title = 'passing?';
    const details = 'not pass!';

    const expectation: IProblemDetail = {
      title,
      detail: details,
      status,
      type: defaultHttpErrors[status],
    };
    filter.catch(new ForbiddenException(title, details), mockArgumentsHost);

    assertResponse(status, expectation);
  });

  describe('the generic HttpException', () => {
    it('should map HttpException response when called with a string', () => {
      const status = HttpStatus.SEE_OTHER;
      const title = 'Not passing';

      const expectation: IProblemDetail = {
        title,
        status,
        type: 'any-type',
      };

      filter.catch(new HttpException(title, status), mockArgumentsHost);

      assertResponse(status, expectation);
    });

    it('should map HttpException response when called with an object', () => {
      const status = HttpStatus.SEE_OTHER;
      const errorObject: IErrorDetail = {
        message: 'some message',
      };

      const expectation: IProblemDetail = {
        title: errorObject.message,
        status,
        type: 'see-other',
      };

      filter.catch(new HttpException(errorObject, status), mockArgumentsHost);

      assertResponse(status, expectation);
    });
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
      title: errorObject.message,
      status,
      type: 'http://example.com/problems/some-problem-detail',
      instance: errorObject.error.instance,
    };

    filter.catch(new HttpException(errorObject, status), mockArgumentsHost);

    assertResponse(status, expectation);
  });
});

describe('when used outside a module', () => {
  const appConfig = config();
  const filter: ExceptionsFilter = new ExceptionsFilter(appConfig);
  it('should map default exception when thrown with not parameters', () => {
    const status = HttpStatus.BAD_REQUEST;
    const expectation: IProblemDetail = {
      title: defaultHttpErrors[status],
      status,
      type: defaultHttpErrors[status],
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
    title: defaultHttpErrors[status],
    status,
    type: defaultHttpErrors[status],
  };

  filter.catch(new BadRequestException(), mockArgumentsHost);

  assertResponse(status, expectation);
});

describe('configuration is undefined', () => {
  const appConfig = undefined;
  const filter = new ExceptionsFilter(appConfig);
  const status = HttpStatus.BAD_REQUEST;
  const expectation: IProblemDetail = {
    title: defaultHttpErrors[status],
    status,
    type: defaultHttpErrors[status],
  };

  filter.catch(new BadRequestException(), mockArgumentsHost);

  assertResponse(status, expectation);
});

function assertResponse(expectedStatus: number, expectedJson: IProblemDetail) {
  expect(mockType).toHaveBeenCalledWith(PROBLEM_CONTENT_TYPE);
  expect(mockStatus).toHaveBeenCalledWith(expectedStatus);
}
