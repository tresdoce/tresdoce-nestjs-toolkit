import https from 'https';
export const AXIOS_INSTANCE_TOKEN = Symbol('AXIOS_INSTANCE_TOKEN');
export const HTTP_MODULE_ID = Symbol('HTTP_MODULE_ID');
export const HTTP_MODULE_OPTIONS = Symbol('HTTP_MODULE_OPTIONS');
export const HTTP_MODULE_CONFIG = Symbol('HTTP_MODULE_CONFIG');
export const HTTP_MODULE_PROPAGATE_HEADERS = Symbol('HTTP_MODULE_PROPAGATE_HEADERS');
export const headers = {
    'Content-Type': 'application/json',
    Accept: `application/vnd.iman.v1+json, application/json, text/plain, */*`,
    //'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    Pragma: 'no-cache',
};
export const propagateDefaultHeaders = ['uber-trace-id', 'x-amzn-trace-id'];
export const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
    requestCert: false,
});
export const defaultConfigInstanceAxios = {
    headers,
    httpsAgent,
};
export var RequestMethod;
(function (RequestMethod) {
    RequestMethod["GET"] = "GET";
    RequestMethod["POST"] = "POST";
    RequestMethod["PUT"] = "PUT";
    RequestMethod["DELETE"] = "DELETE";
    RequestMethod["PATCH"] = "PATCH";
    RequestMethod["ALL"] = "ALL";
    RequestMethod["OPTIONS"] = "OPTIONS";
    RequestMethod["HEAD"] = "HEAD";
})(RequestMethod || (RequestMethod = {}));
