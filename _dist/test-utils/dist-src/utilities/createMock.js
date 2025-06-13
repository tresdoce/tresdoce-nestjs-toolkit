import nock from 'nock';
import { URL } from 'url';
/**
 * HTTP methods that expect a body in the request.
 */
const METHODS_WITH_BODY = ['post', 'put', 'patch'];
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
export const createMock = (_options) => {
    let { url, method, statusCode, responseBody, options = {}, reqBody, queryParams, } = _options;
    const parsedUrl = new URL(url);
    const baseUrl = parsedUrl.origin;
    const endpoint = parsedUrl.pathname;
    /* istanbul ignore next */
    if (!baseUrl || !method || !endpoint) {
        /* istanbul ignore next */
        throw new Error('Missing required parameters: baseUrl, method, and/or endpoint.');
    }
    if (typeof responseBody === 'function') {
        responseBody = responseBody();
    }
    const scope = nock(baseUrl, options);
    let interceptor;
    if (METHODS_WITH_BODY.includes(method)) {
        if (typeof reqBody === 'object' && !(reqBody instanceof Buffer)) {
            interceptor = scope[method](endpoint, JSON.stringify(reqBody));
        }
        else {
            interceptor = scope[method](endpoint, reqBody);
        }
    }
    else {
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
