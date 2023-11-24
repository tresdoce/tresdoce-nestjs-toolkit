import https from 'https';
import { HttpModuleOptions } from '../interfaces/http-module.interface';

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

export const propagateDefaultHeaders: string[] = ['uber-trace-id', 'x-amzn-trace-id'];

export const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  requestCert: false,
});

export const defaultConfigInstanceAxios: HttpModuleOptions = {
  headers,
  httpsAgent,
};

export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  ALL = 'ALL',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
}
