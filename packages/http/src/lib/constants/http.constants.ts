import https from 'https';
import { HttpModuleOptions } from '../interfaces/http-module.interface';
export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN';
export const HTTP_MODULE_ID = 'HTTP_MODULE_ID';
export const HTTP_MODULE_OPTIONS = 'HTTP_MODULE_OPTIONS';
export const HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS = 'HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS';
export const headers = {
  'Content-Type': 'application/json',
  Accept: `application/vnd.iman.v1+json, application/json, text/plain, */*`,
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
};
export const customPropagateHeaders = [
  'id_channel',
  'id_functionality',
  'id_functionality_list',
  'id_module',
  'module_version',
  'id_session',
  'session_id',
];
export const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  requestCert: false,
});

export const defaultConfigInstanceAxios: HttpModuleOptions = {
  headers,
  httpsAgent,
};

export enum HttpMethods {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
}
