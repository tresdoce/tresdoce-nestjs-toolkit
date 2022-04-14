import { ExecutionContext, HttpStatus, Inject, Injectable, LoggerService } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as _ from 'lodash';
import pino from 'pino';
import { LoggingModuleLevel, LogType } from '../typings/logging.types';
import { LEVEL_OPTIONS, LOGGING_OPTIONS } from '../constants/logging.constants';
import { castOjectValuesToString } from '../utils/logging.utils';

const pinoElasticSearch = require('pino-elasticsearch');
const pinoMultiStream = require('pino-multi-stream').multistream;
@Injectable()
export class LoggingService implements LoggerService {
  private logger: pino.Logger;
  private readonly streamToElastic: any;

  constructor(
    @Inject(LEVEL_OPTIONS) private readonly level: LoggingModuleLevel,
    @Inject(LOGGING_OPTIONS) private readonly loggingOptions?: any,
  ) {
    const {
      server: { isProd },
      elasticConfig,
    } = this.loggingOptions;

    if (isProd) {
      if (elasticConfig && !_.isEmpty(elasticConfig)) {
        this.streamToElastic = pinoElasticSearch({
          index: 'api-',
          node: 'http://localhost:9200',
          'es-version': 7,
          ...elasticConfig,
        });
        this.logger = pino(
          { level: this.level },
          pinoMultiStream([{ stream: process.stdout }, { stream: this.streamToElastic }]),
        );
      } else {
        this.logger = pino({ level: this.level });
      }
    } else {
      this.logger = pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
        level: this.level,
      });
    }
  }

  public readFile(pathSegment: string, filename: string) {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, { encoding: 'utf8' }));
  }

  public log(message: any) {
    const log = this.getGenericLog('info');
    log['message'] = message;
    this.logger.info(message);
  }

  public info(message: any, context?: any) {
    const log = this.getGenericLog('info');
    log['message'] = message;
    context ? this.logger.info({ context }, log) : this.logger.info(log);
  }

  public error(message: any, context?: any) {
    const log = this.getGenericLog('error');
    log['message'] = message;
    context ? this.logger.error({ context }, log) : this.logger.error(log);
  }

  public warn(message: any, context?: any) {
    const log = this.getGenericLog('warn');
    log['message'] = message;
    context ? this.logger.warn({ context }, log) : this.logger.warn(log);
  }

  public fatal(message: any, context?: any) {
    const log = this.getGenericLog('fatal');
    log['message'] = message;
    context ? this.logger.fatal({ context }, log) : this.logger.fatal(log);
  }

  public debug(message: any, context?: any) {
    const log = this.getGenericLog('debug');
    log['message'] = message;
    context ? this.logger.debug({ context }, log) : this.logger.debug(log);
  }

  public trace(message: any, context?: any) {
    const log = this.getGenericLog('trace');
    log['message'] = message;
    context ? this.logger.trace({ context }, log) : this.logger.trace(log);
  }

  /**
   * Gets a json object that contains the generic fields that every logs must include.
   * @param loggingLevel
   * @param logType
   * @param timestamp optional timeStamp, default is real time at the method execution moment.
   */
  public getGenericLog(
    loggingLevel: LoggingModuleLevel,
    logType: LogType = 'DEFAULT',
    timestamp?: number,
  ): any {
    const packageInfo = this.readFile(__dirname, '../package.json');

    return {
      application_name: process.env.npm_package_name,
      application_version: process.env.npm_package_version,
      logger_name: packageInfo.name,
      logger_version: packageInfo.version,
      '@timestamp': timestamp ? timestamp : Date.now().toString(),
      log_level: loggingLevel.toUpperCase(),
      log_type: logType,
    };
  }

  public addRequestLogs(
    request: any,
    context: ExecutionContext,
    timeRequest: number,
    requestDuration: number,
  ) {
    const duration = Date.now() - requestDuration;
    const requestLog = this.getGenericLog('info', 'RESPONSE', timeRequest);
    const castHeaders = {};
    _.map(request.headers, function (value, key) {
      castOjectValuesToString(key, value, castHeaders);
    });
    requestLog['thread_name'] = '-';
    requestLog['message'] = 'Request executed';
    requestLog['http_request_execution_context_class'] = context.getClass().name;
    requestLog['http_request_execution_context_handler'] = context.getHandler().name;
    requestLog['http_request_execution_context_type'] = context.getType();
    requestLog['http_request_body'] = request.body;
    requestLog['http_request_headers'] = castHeaders;
    requestLog['http_request_headers_stringify'] = JSON.stringify(request.headers);
    requestLog['http_request_body_stringify'] = JSON.stringify(request.body);
    requestLog['http_duration'] = duration.toString();
    LoggingService.addHttpInfo(request, requestLog);
    // LoggingService.addCustomHeaders(request, requestLog);
    LoggingService.addTracingHeaders(request, requestLog);
    LoggingService.addSecurityHeaders(request, requestLog);
    return requestLog;
  }

  public addResponseLogs(
    request: any,
    response: any,
    body: any,
    timeRequest: number,
    requestDuration: number,
  ) {
    const responseLog = this.getGenericLog('info', 'RESPONSE', timeRequest);
    const duration = Date.now() - requestDuration;
    const castHeaders = {};
    _.map(response.getHeaders(), function (value, key) {
      castOjectValuesToString(key, value, castHeaders);
    });
    responseLog['http_response_status_code'] = response.statusCode
      ? response.statusCode.toString()
      : '-';
    responseLog['http_response_status_phrase'] = HttpStatus[response.statusCode];
    responseLog['http_response_body'] = JSON.stringify(body);
    responseLog['http_response_headers'] = castHeaders;
    responseLog['http_response_headers_stringify'] = JSON.stringify(response.getHeaders());
    responseLog['http_duration'] = duration.toString();
    LoggingService.addHttpInfo(request, responseLog);
    // LoggingService.addCustomHeaders(request, responseLog);
    LoggingService.addTracingHeaders(request, responseLog);
    LoggingService.addSecurityHeaders(request, responseLog);
    return responseLog;
  }

  // private static addCustomHeaders(request: any, JsonLog: any): void {
  //   JsonLog['id_channel'] = request.headers.id_channel ? request.headers.id_channel : '-';
  //   JsonLog['id_functionality'] = request.headers.id_functionality
  //     ? request.headers.id_functionality
  //     : '-';
  //   JsonLog['id_functionality_list'] = request.headers.id_functionality_list
  //     ? request.headers.id_functionality_list
  //     : '-';
  //   JsonLog['id_module'] = request.headers.id_module ? request.headers.id_module : '-';
  //   JsonLog['module_version'] = request.headers.module_version
  //     ? request.headers.module_version
  //     : '-';
  //   JsonLog['id_session'] = request.headers.id_session ? request.headers.id_session : '-';
  // }

  private static addHttpInfo(request: any, jsonLog: any) {
    jsonLog['http_request_address'] = `${request.protocol}://${request.get('host')}${request.path}`;
    jsonLog['http_request_query_string'] = request.query;
    jsonLog['http_request_method'] = request.method;
    jsonLog['http_request_path'] = request.path;
    jsonLog['http_request_remote_address'] = request.ip;
  }

  private static addTracingHeaders(request: any, jsonLog: any) {
    const tracingHeaderJaeger: string = request.headers['uber-trace-id'];
    const jaegerIds = tracingHeaderJaeger ? tracingHeaderJaeger.split(':', 3) : ['-', '-', '-'];
    jsonLog['trace_id'] = jaegerIds[0];
    jsonLog['span_id'] = jaegerIds[1];
    jsonLog['span_parent_id'] = jaegerIds[2];
  }

  private static addSecurityHeaders(request: any, JsonLog: any) {
    const JWT = request.headers['JWT-payload'] || [];
    JsonLog['id_adhesion'] = JWT['id-adhesion'] ? JWT['id-adhesion'] : '-';
    JsonLog['id_host'] = JWT['id-host'] ? JWT['id-host'] : '-';
    JsonLog['id_persona_pom'] = JWT['id-persona-pom'] ? JWT['id-persona-pom'] : '-';
    JsonLog['id_usuario'] = JWT['id-usuario'] ? JWT['id-usuario'] : '-';
    JsonLog['id_usuario_go'] = JWT['id-usuario-go'] ? JWT['id-usuario-go'] : '-';
    JsonLog['cap_scope'] = JWT['cap-scope'] ? JWT['cap-scope'] : '-';
    JsonLog['logging_tracking_id'] = JWT['logging-tracking-id'] ? JWT['logging-tracking-id'] : '-';
  }
}
