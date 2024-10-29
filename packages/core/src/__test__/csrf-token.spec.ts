import { Response } from 'express';
import { sign } from 'cookie-signature';
import Tokens from 'csrf';
import { serialize } from 'cookie';
import { CsrfCookieOptions, csrfToken, getCsrfFromRequest, ICsrfRequest, verify } from '../commons';

jest.mock('cookie-signature');
jest.mock('csrf');
jest.mock('cookie');

describe('CsrfToken', () => {
  let mockRequest: Partial<ICsrfRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
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
      //getHeader: jest.fn().mockReturnValue(undefined),
      getHeader: jest.fn(),
      setHeader: jest.fn(),
      locals: {},
    };
    nextFunction = jest.fn();
    (sign as jest.Mock).mockReturnValue('signed_value');
    (Tokens as jest.Mock).mockImplementation(() => ({
      secretSync: jest.fn().mockReturnValue('secret'),
      create: jest.fn().mockReturnValue('token'),
      verify: jest.fn().mockReturnValue(true),
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
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
    (serialize as jest.Mock).mockReturnValue(options.cookieName);

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
    (serialize as jest.Mock).mockReturnValue(options.cookieName);

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

    (serialize as jest.Mock).mockImplementation((name, value, opts) => {
      return `${name}=${value}; httpOnly; sameSite=${opts.sameSite}`;
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
    mockResponse.getHeader = jest.fn().mockReturnValue(existingCookie);

    (serialize as jest.Mock).mockImplementation((name, value, opts) => {
      return `${name}=${value}; httpOnly; sameSite=${opts.sameSite}`;
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
    (serialize as jest.Mock).mockReturnValue('_csrf');
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
    tokenProvider.create = jest.fn().mockImplementation((secret) => `token_${secret}`);
    tokenProvider.verify = jest
      .fn()
      .mockImplementation((secret, token) => token === `token_${secret}`);

    const token = tokenProvider.create(secret);
    expect(tokenProvider.verify(secret, token)).toBeTruthy();
  });

  it('should not verify an invalid token using verify function', () => {
    const secret = 'secret';
    const token = 'invalid_token';
    jest.spyOn(tokenProvider, 'verify').mockReturnValue(false);

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
});
