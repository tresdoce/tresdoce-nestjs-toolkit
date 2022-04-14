import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoggingService, castOjectValuesToString } from '@tresdoce-nestjs-toolkit/logging';
import Axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as _ from 'lodash';
import {
  AXIOS_INSTANCE_TOKEN,
  HttpMethods,
  customPropagateHeaders,
  HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS,
} from '../constants/http.constants';

@Injectable()
export class HttpClientService {
  private ip: string;
  private headers: any;

  get axiosRef(): AxiosInstance {
    return this.instance;
  }

  constructor(
    @Inject(AXIOS_INSTANCE_TOKEN) private readonly instance: AxiosInstance = Axios,
    @Inject(LoggingService) private readonly loggingService: LoggingService,
    @Inject(HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS) private readonly configHeaders,
  ) {
    this.axiosRef.interceptors.request.use((config: AxiosRequestConfig) => config);
    this.axiosRef.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => error,
    );
  }

  public initAxios(headers: any, ip: any) {
    this.ip = ip;
    this.headers = headers;
  }

  /**
   * Logs the request and response in format using @tresdoce-nestjs-toolkit/logging.
   * @param response http request response
   * @param timeRequest actual datetime
   */
  private logExternalHttp(response: AxiosResponse, timeRequest: number) {
    const requestLog = this.getAxiosRequestLogs(response, timeRequest);
    const responseLog = this.getAxiosResponseLogs(response, timeRequest);
    const duration = Date.now() - timeRequest;
    requestLog['outgoing_http_duration'] = duration.toString();
    responseLog['outgoing_http_duration'] = duration.toString();
    this.loggingService.log(requestLog);
    this.loggingService.log(responseLog);
  }

  /**
   * Retrieve json object in base generic log format.
   * @param response http request response
   * @param timeRequest actual datetime
   */
  private getAxiosRequestLogs(response: AxiosResponse, timeRequest: number) {
    const requestLog = this.loggingService.getGenericLog('info', 'OUTGOING_REQUEST', timeRequest);
    requestLog['log_type'] = 'OUTGOING_REQUEST';
    requestLog['thread_name'] = '-';
    requestLog['message'] = 'Outgoing request executed';
    const url = response.config.url.split('?');
    requestLog['outgoing_http_request_address'] = url[0] ? url[0] : '-';
    requestLog['outgoing_http_request_query_string'] = url[1] ? url[1] : '-';
    requestLog['outgoing_http_request_method'] = response.config.method;
    requestLog['outgoing_http_request_path'] = response.request.path.split('?')[0];
    requestLog['outgoing_http_request_remote_address'] = this.ip;
    requestLog['outgoing_http_request_body'] = response.config.data
      ? JSON.stringify(response.config.data)
      : '-';
    const castHeaders = {};
    _.map(response.config.headers ? response.config.headers : {}, function (value, key) {
      castOjectValuesToString(key, value, castHeaders);
    });
    requestLog['outgoing_http_request_headers'] = castHeaders;
    requestLog['outgoing_http_request_headers_stringify'] = response.config.headers
      ? JSON.stringify(response.config.headers)
      : '-';
    HttpClientService.addTracingHeaders(response.config.headers, requestLog);
    return requestLog;
  }

  /**
   * Retrieve json object in base generic log format.
   * @param response http request response
   * @param timeRequest actual datetime
   */
  private getAxiosResponseLogs(response: AxiosResponse, timeRequest: number) {
    const responseLog = this.loggingService.getGenericLog('info', 'OUTGOING_RESPONSE', timeRequest);
    responseLog['log_type'] = 'OUTGOING_RESPONSE';
    responseLog['thread_name'] = '-';
    responseLog['message'] = 'Outgoing response received';
    responseLog['outgoing_http_response_status_code'] = response.status.toString();
    responseLog['outgoing_http_response_status_phrase'] = HttpStatus[response.status];
    responseLog['outgoing_http_response_body'] = JSON.stringify(response.data);
    const castHeaders = {};
    _.map(response.headers, function (value, key) {
      castOjectValuesToString(key, value, castHeaders);
    });
    responseLog['outgoing_http_response_headers'] = castHeaders;
    responseLog['outgoing_http_response_headers_stringify'] = JSON.stringify(response.headers);
    // HttpClientService.addCustomHeaders(response.headers, responseLog);
    HttpClientService.addTracingHeaders(response.headers, responseLog);
    HttpClientService.addSecurityHeaders(response.headers, responseLog);
    return responseLog;
  }

  private static addTracingHeaders(headers?: any, JsonLog?: any) {
    const tracingHeaderJaeger: string = headers['uber-trace-id'];
    const jaegerIds = tracingHeaderJaeger ? tracingHeaderJaeger.split(':', 3) : ['-', '-', '-'];
    JsonLog['trace_id'] = jaegerIds[0];
    JsonLog['span_id'] = jaegerIds[1];
    JsonLog['span_parent_id'] = jaegerIds[2];
  }

  // private static addCustomHeaders(headers?: any, JsonLog?: any): void {
  //   JsonLog['id_channel'] = headers.id_channel ? headers.id_channel : '-';
  //   JsonLog['id_functionality'] = headers.id_functionality ? headers.id_functionality : '-';
  //   JsonLog['id_functionality_list'] = headers.id_functionality_list
  //     ? headers.id_functionality_list
  //     : '-';
  //   JsonLog['id_module'] = headers.id_module ? headers.id_module : '-';
  //   JsonLog['module_version'] = headers.module_version ? headers.module_version : '-';
  //   JsonLog['id_session'] = headers.id_session ? headers.id_session : '-';
  // }

  private static addSecurityHeaders(headers?: any, JsonLog?: any) {
    const jwtService = new JwtService({});
    const token: string = headers.authorization
      ? headers.authorization.replace('Bearer ', '')
      : null;
    let jwtdecoded = jwtService.decode(token);
    jwtdecoded = jwtdecoded ? jwtdecoded : {};
    const userData = jwtdecoded['user-data'] ? jwtdecoded['user-data'] : {};
    JsonLog['id_adhesion'] = userData['id-adhesion'] ? userData['id-adhesion'] : '-';
    JsonLog['id_host'] = userData['id-host'] ? userData['id-host'] : '-';
    JsonLog['id_persona_pom'] = userData['id-persona-pom'] ? userData['id-persona-pom'] : '-';
    JsonLog['id_usuario'] = userData['id-usuario'] ? userData['id-usuario'] : '-';
    JsonLog['id_usuario_go'] = userData['id-usuario-go'] ? userData['id-usuario-go'] : '-';
    JsonLog['cap_scope'] = userData['cap-scope'] ? userData['cap-scope'] : '-';
    JsonLog['logging_tracking_id'] = userData['logging-tracking-id']
      ? userData['logging-tracking-id']
      : '-';
  }

  /**
   * Make and http request in base of default config, and configuration
   * @param defaultConfig Default configuration, contains URL and Method
   * @param config AxiosRequestConfig type user configuration
   */
  private fetch = async <T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> => {
    let response;
    try {
      const timeRequest = Date.now();
      config = _.omit(config, ['url']);
      config.headers = _.merge(
        _.pick(this.headers, _.union(customPropagateHeaders, this.configHeaders)),
        config.headers,
      );
      response = await this.axiosRef.request({ url: encodeURI(url), ...config });
      this.logExternalHttp(response, timeRequest);
      return response;
    } catch (error) {
      this.loggingService.error(response, 'external api response error');
      this.loggingService.error(error, 'error catched');
      return error;
    }
  };

  /**
   * Make http request  based on axios using user´s config
   * @param config Contanin request configuration (headers, data, url, method...) type AxiosRequestConfig
   */
  public request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(config.url, config);
  }

  /**
   * Make get http request based on axios
   * @param url API url for request
   * @param config Contanin request configuration (headers, httpAgent...) type AxiosRequestConfig
   */
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: HttpMethods.GET });
  }

  /**
   * Make delete http request based on axios
   * @param url API url for request
   * @param config Contanin request configuration (headers, params...) type AxiosRequestConfig
   */
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: HttpMethods.DELETE });
  }

  /**
   * Make head http request based on axios
   * @param url API url for request
   * @param config Contanin request configuration (params, httpAgent...) type AxiosRequestConfig
   */
  public head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: HttpMethods.HEAD });
  }

  /**
   * Make post http request based on axios
   * @param url API url for request
   * @param config Contanin request configuration (headers, data...) type AxiosRequestConfig
   */
  public post<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: HttpMethods.POST });
  }

  /**
   * Make put http request based on axios
   * @param url API url for request
   * @param config Contanin request configuration (headers, data...) type AxiosRequestConfig
   */
  public put<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: HttpMethods.PUT });
  }

  /**
   * Make patch patch request based on axios
   * @param url API url for request
   * @param config Contanin request configuration (headers, data...) type AxiosRequestConfig
   */
  public patch<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.fetch(url, { ...config, method: HttpMethods.PATCH });
  }
}
