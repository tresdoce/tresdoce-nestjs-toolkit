import type { Mock } from 'vitest';
import { HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { CsrfGuard } from '../guards/csrf.guard.js';
import { getCsrfFromRequest, getSecretFromRequest, verify } from '../commons/index.js';
import { getIpAddress } from '../commons/csrf-token.js';

vi.mock('../commons/csrf-token.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../commons/csrf-token.js')>()),
  getSecretFromRequest: vi.fn(),
  getCsrfFromRequest: vi.fn(),
  verify: vi.fn(),
}));

const mockIp = '10.20.30.40';
const mockUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36';
const mockReqDta = Buffer.from(`${mockIp}-${mockUserAgent}`).toString('base64');

const mockExecutionContext = (token: string, secret: string, options: Partial<any> = {}) =>
  ({
    getClass: vi.fn(),
    getHandler: vi.fn(),
    switchToHttp: vi.fn(() => ({
      getRequest: vi.fn().mockReturnValue({
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
        cookieConfig: options.cookieConfig === null ? undefined : options.cookieConfig || {},
        csrfToken: vi.fn(),
      }),
    })),
  }) as any;

describe('CsrfGuard', () => {
  let csrfGuard: CsrfGuard;

  beforeEach(async () => {
    csrfGuard = new CsrfGuard();
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(csrfGuard).toBeDefined();
  });

  it('should throw an explicit error if the csrfToken middleware is not configured', () => {
    const context = mockExecutionContext('', '', { cookieConfig: null });
    expect(() => csrfGuard.canActivate(context)).toThrow(InternalServerErrorException);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(true);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
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
    (getSecretFromRequest as Mock).mockReturnValue(secret);
    (getCsrfFromRequest as Mock).mockReturnValue(token);
    (verify as Mock).mockReturnValue(false);
    expect(() => csrfGuard.canActivate(context)).toThrow(
      new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN),
    );
  });
});
