import { HttpException, HttpStatus } from '@nestjs/common';
import { CsrfGuard } from '../guards/csrf.guard';
import { getCsrfFromRequest, getSecretFromRequest, verify } from '../commons';
import { getIpAddress } from '../commons/csrf-token';

jest.mock('../commons/csrf-token', () => ({
  ...jest.requireActual('../commons/csrf-token'),
  getSecretFromRequest: jest.fn(),
  getCsrfFromRequest: jest.fn(),
  verify: jest.fn(),
}));

const mockIp = '10.20.30.40';
const mockUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
const mockReqDta = Buffer.from(`${mockIp}-${mockUserAgent}`).toString('base64');

const mockExecutionContext = (token: string, secret: string, options: Partial<any> = {}) =>
  ({
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn().mockReturnValue({
        headers: {
          'csrf-token': token,
          ...options.headers,
        },
        cookies: {
          _csrf: secret,
          ...options.cookies,
        },
        signedCookies: options.signedCookies || {},
        query: options.query || {},
        body: options.body || {},
        method: 'get',
        route: {
          path: '/',
        },
        cookieConfig: options.cookieConfig || {},
        csrfToken: jest.fn(),
      }),
    })),
  }) as any;

describe('CsrfGuard', () => {
  let csrfGuard: CsrfGuard;

  beforeEach(async () => {
    csrfGuard = new CsrfGuard();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(csrfGuard).toBeDefined();
  });

  it('should throw an exception if CSRF token is not found', () => {
    const context = mockExecutionContext('', '');
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('CSRF token not found', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception if CSRF token is invalid', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'fake_token';
    const options = {
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext(token, secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception if CSRF token is invalid device', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'fake_token';
    const options = {
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': '',
      },
    };
    const context = mockExecutionContext(token, secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid device', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception if CSRF token is invalid IP device', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'fake_token';
    const options = {
      headers: {
        'x-forwarded-for': '',
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext(token, secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid IP device', HttpStatus.FORBIDDEN),
    );
  });

  it('should allow access if CSRF token is valid', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'fake_csrf_token';
    const options = {
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext(token, secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(true);
    expect(csrfGuard.canActivate(context)).toBeTruthy();
  });

  it('should throw an exception if CSRF token is only found in body but is invalid', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'csrf-token-body';
    const options = {
      body: { _csrf: token },
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext('', secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception if CSRF token is only found in query but is invalid', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'csrf-token-query';
    const options = {
      query: { _csrf: token },
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext('', secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception if CSRF token is only found in cookie but is invalid', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'csrf-token-cookie';
    const options = {
      cookies: { 'xsrf-token': token },
      cookieConfig: { cookieName: 'xsrf-token' },
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext('', secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception if CSRF token is only found in signed cookie but is invalid', () => {
    const secret = `${mockReqDta}-secret`;
    const token = 'csrf-token-signed-cookie';
    const options = {
      signedCookies: { 'xsrf-token': token },
      cookieConfig: { cookieName: 'xsrf-token' },
      headers: {
        'x-forwarded-for': mockIp,
        'user-agent': mockUserAgent,
      },
    };
    const context = mockExecutionContext('', secret, options);
    (getSecretFromRequest as jest.Mock).mockReturnValue(secret);
    (getCsrfFromRequest as jest.Mock).mockReturnValue(token);
    (verify as jest.Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN),
    );
  });
});
