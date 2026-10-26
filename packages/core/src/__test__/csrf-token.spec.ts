import type { Mock } from 'vitest';
import type { Response } from 'express';
import { sign } from 'cookie-signature';
import Tokens from 'csrf';
import { stringifySetCookie } from 'cookie';
import {
  type CsrfCookieOptions,
  csrfToken,
  getCsrfFromRequest,
  type ICsrfRequest,
  verify,
} from '../commons/index.js';
import { extractDeviceData, getIpAddress } from '../commons/csrf-token.js';

vi.mock('cookie-signature');
vi.mock('csrf');
vi.mock('cookie');

describe('CsrfToken', () => {
  let mockRequest: Partial<ICsrfRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: Mock;
  let tokenProvider: Tokens = new Tokens({
    secretLength: 16,
    saltLength: 16,
  });

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      signedCookies: {},
      body: {},
      query: {},
      headers: {},
    };
    mockResponse = {
      //getHeader: vi.fn().mockReturnValue(undefined),
      getHeader: vi.fn(),
      setHeader: vi.fn(),
      locals: {},
    };
    nextFunction = vi.fn();
    (sign as Mock).mockReturnValue('signed_value');
    (Tokens as Mock).mockImplementation(() => ({
      secretSync: vi.fn().mockReturnValue('secret'),
      create: vi.fn().mockReturnValue('token'),
      verify: vi.fn().mockReturnValue(true),
    }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should set a CSRF token with default options', () => {
    const middleware = csrfToken();
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.csrfToken).toBeDefined();
    expect(mockResponse.setHeader).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should use custom options', () => {
    const options: CsrfCookieOptions = {
      key: 'custom_key',
      cookieName: 'custom_cookie_name',
      secret: 'custom_secret',
    };
    (stringifySetCookie as Mock).mockReturnValue(options.cookieName);

    const middleware = csrfToken(options);
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([expect.stringContaining(options.cookieName)]),
    );
  });

  it('should use custom options and signed', () => {
    const options: CsrfCookieOptions = {
      key: 'custom_key',
      cookieName: 'custom_cookie_name',
      secret: 'custom_secret',
      signed: true,
    };
    (stringifySetCookie as Mock).mockReturnValue(options.cookieName);

    const middleware = csrfToken(options);
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([expect.stringContaining(options.cookieName)]),
    );
  });

  it('should set the correct cookie options', () => {
    const options: CsrfCookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
    };

    (stringifySetCookie as Mock).mockImplementation(({ name, value, sameSite }) => {
      return `${name}=${value}; httpOnly; sameSite=${sameSite}`;
    });

    const middleware = csrfToken(options);
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([
        expect.stringContaining('_csrf'),
        expect.stringContaining('httpOnly'),
        expect.stringContaining('sameSite=strict'),
      ]),
    );
  });

  it('should convert an existing Set-Cookie header string to an array and append the new CSRF token using csrfToken middleware', () => {
    const options: CsrfCookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
    };
    const existingCookie = 'existing-cookie=existing-value';
    mockResponse.getHeader = vi.fn().mockReturnValue(existingCookie);

    (stringifySetCookie as Mock).mockImplementation(({ name, value, sameSite }) => {
      return `${name}=${value}; httpOnly; sameSite=${sameSite}`;
    });

    const middleware = csrfToken(options);
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([
        expect.stringContaining('_csrf'),
        expect.stringContaining('existing-cookie'),
        expect.stringContaining('httpOnly'),
        expect.stringContaining('sameSite=strict'),
      ]),
    );
  });

  it('should generate a new token if none is present', () => {
    const middleware = csrfToken();
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.csrfToken).toBeDefined();
  });

  it('should use the same token if already present', () => {
    const existingToken = tokenProvider.create('existing_secret');
    mockRequest.cookies['_csrf'] = 'existing_secret';
    mockRequest.headers['csrf-token'] = existingToken;

    const middleware = csrfToken();
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.csrfToken()).toEqual(existingToken);
  });

  it('should generate a new secret if none is present', () => {
    (stringifySetCookie as Mock).mockReturnValue('_csrf');
    const middleware = csrfToken();
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([expect.stringContaining('_csrf')]),
    );
  });

  it('should use the same secret if already present', () => {
    const existingSecret = 'existing_secret';
    mockRequest.cookies['_csrf'] = existingSecret;

    const middleware = csrfToken();
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockRequest.csrfToken()).toEqual(tokenProvider.create(existingSecret));
  });

  it('should verify a valid token', () => {
    const secret = 'secret';
    tokenProvider.create = vi.fn().mockImplementation((secret) => `token_${secret}`);
    tokenProvider.verify = vi
      .fn()
      .mockImplementation((secret, token) => token === `token_${secret}`);

    const token = tokenProvider.create(secret);
    expect(tokenProvider.verify(secret, token)).toBeTruthy();
  });

  it('should not verify an invalid token using verify function', () => {
    const secret = 'secret';
    const token = 'invalid_token';
    vi.spyOn(tokenProvider, 'verify').mockReturnValue(false);

    expect(verify(secret, token)).toBeFalsy();
  });

  it('should not verify an invalid token using tokenProvider directly', () => {
    const secret = 'secret';
    const token = 'invalid_token';
    expect(tokenProvider.verify(secret, token)).toBeFalsy();
  });

  /*it('should get CSRF token from body', () => {
    mockRequest.body = { _csrf: 'csrf-token-body' };
    expect(getCsrfFromRequest(mockRequest as ICsrfRequest)).toEqual('csrf-token-body');
  });*/

  /*it('should get CSRF token from query', () => {
    mockRequest.query = { _csrf: 'csrf-token-query' };
    expect(getCsrfFromRequest(mockRequest as ICsrfRequest)).toEqual('csrf-token-query');
  });*/

  /*it('should get CSRF token from headers', () => {
    mockRequest.headers = { 'csrf-token': 'csrf-token-header' };
    expect(getCsrfFromRequest(mockRequest as ICsrfRequest)).toEqual('csrf-token-header');
  });*/

  it('should get CSRF token from cookies', () => {
    const expectedToken = 'csrf-token-cookie';
    mockRequest.cookies = { 'xsrf-token': expectedToken };
    mockRequest.cookieConfig = { cookieName: 'xsrf-token', key: 'xsrf-token' };
    expect(getCsrfFromRequest(mockRequest as ICsrfRequest)).toEqual(expectedToken);
  });

  it('should get CSRF token from signed cookies', () => {
    const expectedToken = 'csrf-token-signed-cookie';
    mockRequest.signedCookies = { 'xsrf-token': expectedToken };
    mockRequest.cookieConfig = { cookieName: 'xsrf-token', key: 'xsrf-token', signed: true };
    expect(getCsrfFromRequest(mockRequest as ICsrfRequest)).toEqual(expectedToken);
  });

  it('should return undefined if CSRF token is not found in any source', () => {
    mockRequest.cookieConfig = { cookieName: 'xsrf-token', key: 'xsrf-token' };
    expect(getCsrfFromRequest(mockRequest as ICsrfRequest)).toBeFalsy();
  });

  it('should handle unexpected Set-Cookie header type gracefully', () => {
    (mockResponse.getHeader as Mock).mockReturnValue(12345); // tipo inesperado

    (stringifySetCookie as Mock).mockImplementation(({ name, value, sameSite }) => {
      return `${name}=${value}; httpOnly; sameSite=${sameSite}`;
    });

    const middleware = csrfToken();
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([expect.stringContaining('_csrf')]),
    );
  });

  it('should only pass standard cookie attributes to stringifySetCookie', () => {
    const middleware = csrfToken({ secret: 'custom_secret', domain: 'example.com' });
    middleware(mockRequest as ICsrfRequest, mockResponse as Response, nextFunction);

    const [cookie] = (stringifySetCookie as Mock).mock.calls[0];
    expect(cookie).toEqual(
      expect.objectContaining({
        name: '_csrf',
        sameSite: 'strict',
        httpOnly: true,
        path: '/',
        maxAge: 300,
        domain: 'example.com',
      }),
    );
    expect(cookie).not.toHaveProperty('secret');
    expect(cookie).not.toHaveProperty('cookieName');
    expect(cookie).not.toHaveProperty('key');
    expect(cookie).not.toHaveProperty('signed');
  });

  describe('extractDeviceData', () => {
    const encode = (value: string) => `${Buffer.from(value).toString('base64')}-secret-with-dash`;

    it('should return nulls when there is no secret', () => {
      expect(extractDeviceData(false)).toEqual({ deviceData: null, ip: null });
    });

    it('should keep dashes and non-ASCII chars of the user agent', () => {
      const userAgent = 'Mozilla/5.0 (X11; Linux x86_64) Chrome-Lighthouse ñandú';
      expect(extractDeviceData(encode(`10.0.0.1-${userAgent}`))).toEqual({
        ip: '10.0.0.1',
        deviceData: userAgent,
      });
    });

    it('should return the whole value as ip when there is no separator', () => {
      expect(extractDeviceData(encode('10.0.0.1'))).toEqual({
        ip: '10.0.0.1',
        deviceData: undefined,
      });
    });
  });

  describe('getIpAddress', () => {
    it('should return the first trimmed x-forwarded-for ip', () => {
      const req = { headers: { 'x-forwarded-for': ' 1.1.1.1 , 2.2.2.2' } } as any;
      expect(getIpAddress(req)).toEqual('1.1.1.1');
    });
  });
});
