import nock, { Interceptor } from 'nock';
import { URL } from 'url';

/**
 * Represents the supported HTTP methods for the mock.
 */
type HttpMethod = 'get' | 'post' | 'put' | 'head' | 'patch' | 'delete' | 'options';

/**
 * Represents the expected query parameters structure.
 */
type QueryParams = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | null | undefined;
};

/**
 * Represents the types that can be used to match request headers.
 * It can be either a direct string match or a custom matcher function
 * provided by nock to offer more flexibility in header matching.
 *
 * @typedef {nock.RequestHeaderMatcher | string} RequestHeaderMatcherType
 */
type RequestHeaderMatcherType = nock.RequestHeaderMatcher | string;

/**
 * Interface for the configuration options to create a nock mock.
 *
 * @property {string | RegExp | URL} baseUrl - The base URL to intercept.
 * @property {HttpMethod} method - The HTTP method to intercept.
 * @property {string} endpoint - The specific endpoint (path) to intercept.
 * @property {number} statusCode - The HTTP status code to respond with.
 * @property {string | Record<string, unknown>} responseBody - The response body to return.
 * @property {nock.Options & { reqheaders?: nock.RequestHeaderMatcher }} [options] - Optional nock configuration options for the interceptor.
 * @property {string | Record<string, unknown> | Buffer} [reqBody] - Optional expected request body, mainly for methods like POST, PUT, etc.
 * @property {QueryParams} [queryParams] - Optional expected query parameters in the request.
 */
interface CreateMock {
  baseUrl: string | RegExp | URL;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  responseBody: string | Record<string, unknown>;
  options?: nock.Options & { reqheaders?: Record<string, RequestHeaderMatcherType> };
  reqBody?: string | Record<string, unknown> | Buffer;
  queryParams?: QueryParams;
}

/**
 * List of HTTP methods that expect a body in the request.
 */
const METHODS_WITH_BODY: HttpMethod[] = ['post', 'put', 'patch'];

/**
 * Creates a nock mock based on the provided options.
 *
 * @param _options - Configuration options for the mock.
 * @returns A configured nock interceptor.
 * @example
 *
 * const mock = createMock({
 *   baseUrl: 'http://example.com',
 *   method: 'get',
 *   endpoint: '/api/data',
 *   statusCode: 200,
 *   responseBody: { success: true }
 * });
 *
 * // Now any GET request to 'http://example.com/api/data' will return { success: true } with a 200 status code.
 */
export const createMock = (_options: CreateMock): Interceptor => {
  const {
    baseUrl,
    options = {},
    method,
    endpoint,
    statusCode,
    responseBody,
    reqBody,
    queryParams,
  } = _options;

  const scope: nock.Scope = nock(baseUrl, options);
  let interceptor: nock.Interceptor;

  if (METHODS_WITH_BODY.includes(method)) {
    if (typeof reqBody === 'object' && !(reqBody instanceof Buffer)) {
      interceptor = scope[method](endpoint, JSON.stringify(reqBody));
    } else {
      interceptor = scope[method](endpoint, reqBody);
    }
  } else {
    interceptor = scope[method](endpoint);
  }

  if (queryParams) {
    interceptor.query(queryParams);
  }

  interceptor.reply(statusCode, responseBody);
  return interceptor;
};

export const cleanAllMock = () => nock.cleanAll();
