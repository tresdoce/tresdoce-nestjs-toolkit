import { Inject, Injectable } from '@nestjs/common';
import Axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import _ from 'lodash';
import { Request } from 'express';

import {
  AXIOS_INSTANCE_TOKEN,
  defaultConfigInstanceAxios,
  HTTP_MODULE_PROPAGATE_HEADERS,
  propagateDefaultHeaders,
  RequestMethod,
} from '../constants/http.constants';

@Injectable()
export class HttpClientService {
  private ip: string;
  private headers: any = defaultConfigInstanceAxios.headers;
  private readonly propagateHeadersList: string[];

  /* istanbul ignore next */
  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN) private readonly _instance: AxiosInstance = Axios,
    @Inject(HTTP_MODULE_PROPAGATE_HEADERS) private readonly httpPropagateHeaders: string[] = [],
  ) {
    this.propagateHeadersList = _.union(propagateDefaultHeaders, this.httpPropagateHeaders);
    this.axiosRef.interceptors.request.use(
      (
        config: InternalAxiosRequestConfig<any>,
      ): InternalAxiosRequestConfig<any> | Promise<InternalAxiosRequestConfig<any>> => config,
    );
    this.axiosRef.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => response,
      (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
    );
  }

  get axiosRef(): AxiosInstance {
    return this._instance;
  }

  public initAxios({ headers, ip }: Request): void {
    const propagateHeaders = Object.keys(headers)
      .filter((key) => this.propagateHeadersList.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: headers[key] }), {});
    this.ip = ip;
    this.headers = _.merge({}, defaultConfigInstanceAxios.headers, propagateHeaders);
  }

  // Methods

  /**
   * Make and http request in base of default config, and configuration
   * @param url API url for request
   * @param config AxiosRequestConfig type user configuration
   */
  private fetch = async <T = any>(
    url: string,
    config: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    try {
      config = _.omit(config, ['url']);
      config.headers = _.merge({}, this.headers, config.headers);
      return await this.axiosRef.request({
        url: encodeURI(url),
        ...config,
      });
    } catch (error) {
      throw error;
    }
  };

  /**
   * Make http request  based on axios using user´s config
   * @param config Contain request configuration (headers, data, url, method...) type AxiosRequestConfig
   */
  public request = async <T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return this.fetch(config.url, config);
  };

  /**
   * Make get http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, httpAgent...) type AxiosRequestConfig
   */
  public get = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.GET });
  };

  /**
   * Make post http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
   */
  public post = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.POST });
  };

  /**
   * Make put http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
   */
  public put = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.PUT });
  };

  /**
   * Make patch patch request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
   */
  public patch = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.PATCH });
  };

  /**
   * Make delete http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, params...) type AxiosRequestConfig
   */
  public delete = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.DELETE });
  };

  /**
   * Make head http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (params, httpAgent...) type AxiosRequestConfig
   */
  public head = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.HEAD });
  };
}
