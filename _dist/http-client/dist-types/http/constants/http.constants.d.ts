import https from 'https';
import { HttpModuleOptions } from '../interfaces/http-module.interface';
export declare const AXIOS_INSTANCE_TOKEN: unique symbol;
export declare const HTTP_MODULE_ID: unique symbol;
export declare const HTTP_MODULE_OPTIONS: unique symbol;
export declare const HTTP_MODULE_CONFIG: unique symbol;
export declare const HTTP_MODULE_PROPAGATE_HEADERS: unique symbol;
export declare const headers: {
    'Content-Type': string;
    Accept: string;
    'Cache-Control': string;
    Pragma: string;
};
export declare const propagateDefaultHeaders: string[];
export declare const httpsAgent: https.Agent;
export declare const defaultConfigInstanceAxios: HttpModuleOptions;
export declare enum RequestMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
    ALL = "ALL",
    OPTIONS = "OPTIONS",
    HEAD = "HEAD"
}
