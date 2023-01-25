import { Inject, Injectable } from '@nestjs/common';
import Axios, {
  AxiosInstance,
  RawAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosError,
} from 'axios';
import { AXIOS_INSTANCE_TOKEN, RequestMethod } from '../constants/http.constants';
import * as _ from 'lodash';

@Injectable()
export class HttpClientService {
  private ip: string;
  private headers: any;

  /* istanbul ignore next */
  constructor(@Inject(AXIOS_INSTANCE_TOKEN) private readonly _instance: AxiosInstance = Axios) {
    this.axiosRef.interceptors.request.use(
      (config: AxiosRequestConfig): AxiosRequestConfig => config,
      //(error: AxiosError): Promise<AxiosError> => Promise.reject(error),
    );
    this.axiosRef.interceptors.response.use(
      (response: AxiosResponse): AxiosResponse => response,
      (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
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
   * @param config RawAxiosRequestConfig type user configuration
   */
  private fetch = async <T = any>(
    url: string,
    config: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    try {
      config = _.omit(config, ['url']);
      config.headers = _.merge(this.headers, config.headers);
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
   * @param config Contain request configuration (headers, data, url, method...) type RawAxiosRequestConfig
   */
  public request = async <T = any>(config: RawAxiosRequestConfig): Promise<AxiosResponse<T>> => {
    return this.fetch(config.url, config);
  };

  /**
   * Make get http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, httpAgent...) type RawAxiosRequestConfig
   */
  public get = async <T = any>(
    url: string,
    config?: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.GET });
  };

  /**
   * Make post http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type RawAxiosRequestConfig
   */
  public post = async <T = any>(
    url: string,
    config?: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.POST });
  };

  /**
   * Make put http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type RawAxiosRequestConfig
   */
  public put = async <T = any>(
    url: string,
    config?: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.PUT });
  };

  /**
   * Make patch patch request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, data...) type RawAxiosRequestConfig
   */
  public patch = async <T = any>(
    url: string,
    config?: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.PATCH });
  };

  /**
   * Make delete http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (headers, params...) type RawAxiosRequestConfig
   */
  public delete = async <T = any>(
    url: string,
    config?: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.DELETE });
  };

  /**
   * Make head http request based on axios
   * @param url API url for request
   * @param config Contain request configuration (params, httpAgent...) type RawAxiosRequestConfig
   */
  public head = async <T = any>(
    url: string,
    config?: RawAxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    return this.fetch(url, { ...config, method: RequestMethod.HEAD });
  };
}
