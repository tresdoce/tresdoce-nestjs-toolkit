import { Inject, Injectable, Optional } from '@nestjs/common';
import { LoggingService } from '@tresdoce-nestjs-toolkit/logger';
import Axios, { type AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import _ from 'lodash';
import type { Request } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';

import {
  AXIOS_INSTANCE_TOKEN,
  defaultConfigInstanceAxios,
  HTTP_MODULE_PROPAGATE_HEADERS,
  propagateDefaultHeaders,
  RequestMethod,
} from '../constants/http.constants.js';

/** Headers and client IP captured from the incoming request that triggered an outgoing call. */
interface OutgoingRequestContext {
  headers: Record<string, unknown>;
  ip?: string;
}

/**
 * Per-request storage. `HttpClientService` is a singleton shared by every incoming request, so
 * the propagated headers live in the request's async context instead of on the instance.
 */
const outgoingRequestContext = new AsyncLocalStorage<OutgoingRequestContext>();

@Injectable()
export class HttpClientService {
  private readonly propagateHeadersList: string[];

  /* istanbul ignore next */
  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN) private readonly _instance: AxiosInstance = Axios,
    @Inject(HTTP_MODULE_PROPAGATE_HEADERS) private readonly httpPropagateHeaders: string[] = [],
    // Optional: outgoing requests are logged only when the app registers LoggingModule.
    @Optional() @Inject(LoggingService) private readonly logger?: LoggingService,
  ) {
    // Express lowercases incoming header names, so the configured list is lowercased too.
    this.propagateHeadersList = _.union(propagateDefaultHeaders, this.httpPropagateHeaders).map(
      (header) => header.toLowerCase(),
    );
  }

  get axiosRef(): AxiosInstance {
    return this._instance;
  }

  /**
   * Captures the headers to propagate (and the client IP) from the incoming request. They are
   * stored in the current async context, so concurrent requests never see each other's headers.
   * `HttpClientInterceptor` calls it for every request; outside a request (crons, bootstrap)
   * only the default headers are sent.
   */
  public initAxios({ headers, ip }: Request): void {
    const propagateHeaders = Object.keys(headers)
      .filter((key) => this.propagateHeadersList.includes(key))
      .reduce((obj, key) => ({ ...obj, [key]: headers[key] }), {});
    outgoingRequestContext.enterWith({
      headers: _.merge({}, defaultConfigInstanceAxios.headers, propagateHeaders),
      ip,
    });
  }

  private get requestContext(): OutgoingRequestContext {
    return (
      outgoingRequestContext.getStore() ?? {
        headers: defaultConfigInstanceAxios.headers as Record<string, unknown>,
      }
    );
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
    config = _.omit(config, ['url']);
    config.headers = _.merge({}, this.requestContext.headers, config.headers);
    const startTime = Date.now();
    try {
      const response = await this.axiosRef.request<T>({
        url: url === undefined ? undefined : encodeURI(url),
        ...config,
      });
      this.logOutgoingRequest(url, config, startTime, response.status);
      return response;
    } catch (error) {
      this.logOutgoingRequest(
        url,
        config,
        startTime,
        (error as AxiosError)?.response?.status,
        error,
      );
      throw error;
    }
  };

  /**
   * Logs an outgoing request through LoggingService, when available. Headers, body and query
   * string are left out on purpose: they often carry tokens or personal data.
   */
  private logOutgoingRequest(
    url: string,
    config: AxiosRequestConfig,
    startTime: number,
    status?: number,
    error?: unknown,
  ): void {
    if (!this.logger) return;
    const level = error ? 'error' : 'info';
    const log = {
      ...this.logger.getGenericLog(level, 'OUTGOING_REQUEST', startTime),
      message: error
        ? `Outgoing request failed: ${error instanceof Error ? error.message : String(error)}`
        : 'Outgoing request executed',
      outgoing_http_request_method: (config.method ?? 'GET').toUpperCase(),
      outgoing_http_request_address: HttpClientService.sanitizeUrl(url ?? config.baseURL),
      outgoing_http_request_remote_address: this.requestContext.ip ?? '-',
      outgoing_http_response_status_code: status ?? '-',
      outgoing_http_request_duration_ms: Date.now() - startTime,
    };
    if (error) {
      this.logger.error(log, HttpClientService.name);
    } else {
      this.logger.log(log, HttpClientService.name);
    }
  }

  /**
   * Removes query string, fragment and credentials (`user:pass@`) from a URL before logging it.
   */
  private static sanitizeUrl(url?: string): string {
    if (!url) return '-';
    return url.split(/[?#]/)[0].replace(/\/\/[^/@]*@/, '//');
  }

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
