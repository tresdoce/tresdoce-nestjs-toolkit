import nock, { Interceptor, Options, RequestHeaderMatcher } from 'nock';
import { URL } from 'url';

/**
 * Supported HTTP methods for the mock.
 */
type HttpMethod = 'get' | 'post' | 'put' | 'head' | 'patch' | 'delete' | 'options';

/**
 * Structure for expected query parameters.
 */
type QueryParams = {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | null | undefined;
};

/**
 * Types for matching request headers. Can be a direct string match or a custom matcher function.
 */
type RequestHeaderMatcherType = RequestHeaderMatcher | string;

/**
 * Configuration options for creating a nock mock.
 *
 * @property {string} url - The complete URL to intercept.
 * @property {HttpMethod} method - The HTTP method to intercept.
 * @property {number} statusCode - The HTTP status code to respond with.
 * @property {string | Record<string, unknown> | Buffer | (() => Record<string, unknown>)} responseBody - The response body. Can be a string, object, Buffer, or function returning an object.
 * @property {Options & { reqheaders?: Record<string, RequestHeaderMatcherType> }} [options] - Optional nock configuration options.
 * @property {string | Record<string, unknown> | Buffer} [reqBody] - Optional expected request body.
 * @property {QueryParams} [queryParams] - Optional expected query parameters.
 */
interface CreateMock {
  url: string;
  method: HttpMethod;
  statusCode: number;
  responseBody: string | Record<string, unknown> | Buffer | (() => Record<string, unknown>);
  options?: Options & { reqheaders?: Record<string, RequestHeaderMatcherType> };
  reqBody?: string | Record<string, unknown> | Buffer;
  queryParams?: QueryParams;
}

/**
 * HTTP methods that expect a body in the request.
 */
const METHODS_WITH_BODY: HttpMethod[] = ['post', 'put', 'patch'];

/**
 * Creates a nock mock based on provided options.
 *
 * @param _options - Configuration options for the mock.
 * @returns A configured nock interceptor.
 * @example
 *
 * // Using a JSON object as responseBody
 * const mock1 = createMock({
 *   url: 'http://example.com/api/data',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: { success: true }
 * });
 *
 * // Using a string as responseBody
 * const mock2 = createMock({
 *   url: 'http://example.com/api/message',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: 'Success message'
 * });
 *
 * // Using a Buffer as responseBody
 * const mock3 = createMock({
 *   url: 'http://example.com/api/file',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: Buffer.from('Some binary data')
 * });
 *
 * // Using a function returning a JSON object as responseBody
 * const mock4 = createMock({
 *   url: 'http://example.com/api/dynamicData',
 *   method: 'get',
 *   statusCode: 200,
 *   responseBody: () => JSON.parse(fs.readFileSync('path/to/fixture.json', 'utf8'))
 * });
 */
export const createMock = (_options: CreateMock): Interceptor => {
  let {
    url,
    method,
    statusCode,
    responseBody,
    options = {},
    reqBody,
    queryParams,
  }: CreateMock = _options;

  const parsedUrl: URL = new URL(url);
  const baseUrl: string = parsedUrl.origin;
  const endpoint: string = parsedUrl.pathname;

  /* istanbul ignore next */
  if (!baseUrl || !method || !endpoint) {
    /* istanbul ignore next */
    throw new Error('Missing required parameters: baseUrl, method, and/or endpoint.');
  }

  if (typeof responseBody === 'function') {
    responseBody = responseBody();
  }

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

/**
 * Cleans all the mocks created by nock.
 */
export const cleanAllMock = () => nock.cleanAll();
