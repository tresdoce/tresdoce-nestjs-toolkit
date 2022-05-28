import { HttpException, Inject, Injectable } from '@nestjs/common';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AXIOS_INSTANCE_TOKEN, RequestMethod } from '../constants/http.constants';
import * as _ from 'lodash';

@Injectable()
export class HttpClientService {
  private ip: string;
  private headers: any;

  /* istanbul ignore next */
  constructor(@Inject(AXIOS_INSTANCE_TOKEN) private readonly _instance: AxiosInstance = Axios) {
    this.axiosRef.interceptors.request.use((config: AxiosRequestConfig) => config);
    this.axiosRef.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => error,
    );
  }

  get axiosRef(): AxiosInstance {
    return this._instance;
  }

  public initAxios(headers: any, ip: any): void {
    this.ip = ip;
    this.headers = headers;
  }

  // Methods

  /**
   * Make and http request in base of default config, and configuration
   * @param url API url for request
   * @param config AxiosRequestConfig type user configuration
   */
  private fetch<T = any>(url: string, config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      config = _.omit(config, ['url']);
      config.headers = _.merge(this.headers, config.headers);
      return this.axiosRef.request({
        url,
        ...config,
      });
    } catch (error) {
      /* istanbul ignore next */
      throw new HttpException(
        error.response.errors || error.response || 'Unknown Error',
        error.status || 500,
      );
      //throw error;
      //return error;
    }
  }

  /**
   * Make http request  based on axios using user´s config
   * @param config Contain request configuration (headers, data, url, method...) type AxiosRequestConfig
   */
  public request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(config.url, config);
  }

  /**
   * Make get http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, httpAgent...) type AxiosRequestConfig
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: RequestMethod.GET });
  }

  /**
   * Make post http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
   */
  public post<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: RequestMethod.POST });
  }

  /**
   * Make put http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
   */
  public put<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: RequestMethod.PUT });
  }

  /**
   * Make patch patch request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
   */
  public patch<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: RequestMethod.PATCH });
  }

  /**
   * Make delete http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, params...) type AxiosRequestConfig
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: RequestMethod.DELETE });
  }

  /**
   * Make head http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (params, httpAgent...) type AxiosRequestConfig
   */
  public head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: RequestMethod.HEAD });
  }
}
