import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
export declare class HttpClientService {
    private readonly _instance;
    private readonly httpPropagateHeaders;
    private ip;
    private headers;
    private readonly propagateHeadersList;
    constructor(_instance?: AxiosInstance, httpPropagateHeaders?: string[]);
    get axiosRef(): AxiosInstance;
    initAxios({ headers, ip }: Request): void;
    /**
     * Make and http request in base of default config, and configuration
     * @param url API url for request
     * @param config AxiosRequestConfig type user configuration
     */
    private fetch;
    /**
     * Make http request  based on axios using user´s config
     * @param config Contain request configuration (headers, data, url, method...) type AxiosRequestConfig
     */
    request: <T = any>(config: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    /**
     * Make get http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, httpAgent...) type AxiosRequestConfig
     */
    get: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    /**
     * Make post http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
     */
    post: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    /**
     * Make put http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
     */
    put: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    /**
     * Make patch patch request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
     */
    patch: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    /**
     * Make delete http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, params...) type AxiosRequestConfig
     */
    delete: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
    /**
     * Make head http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (params, httpAgent...) type AxiosRequestConfig
     */
    head: <T = any>(url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse<T>>;
}
