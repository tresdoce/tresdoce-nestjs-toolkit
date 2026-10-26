import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  LoggerService,
} from '@nestjs/common';
import { FormatService, RedactService } from '@tresdoce-nestjs-toolkit/utils';
import * as path from 'path';
import * as fs from 'fs';
import pino from 'pino';
import type { Request, Response } from 'express';
import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

import {
  DEFAULT_BASE_GENERIC_LOG,
  LOGGING_MODULE_OPTIONS,
} from '../constants/logging.constants.js';
import type {
  LoggerModuleOptions,
  LoggingModuleLevel,
  LogType,
} from '../interfaces/logging.interface.js';

/**
 * Base shape shared by every log emitted through `getGenericLog`.
 */
interface GenericLog {
  application_name?: string;
  application_version?: string;
  logger_name: string;
  logger_version: string;
  '@timestamp': string;
  log_level: string;
  log_type: LogType;
  message?: unknown;
  stack?: string;
}

/** Fields added by `addHttpInfo`, shared by both request and response logs. */
interface HttpInfoFields {
  http_request_address: string;
  http_request_query_string: unknown;
  http_request_method: string;
  http_request_path: string;
  http_request_remote_address: string | undefined;
}

/** Fields added by `addTracingHeaders`, shared by both request and response logs. */
interface TracingHeaderFields {
  'uber-trace-id'?: string;
  trace_id: string;
  span_id: string;
  span_parent_id: string;
  'x-amzn-trace-id'?: string;
  x_amzn_trace_id: string;
  x_amzn_paren_id: string;
  x_amzn_sampled_id: string;
}

interface RequestLog extends GenericLog, HttpInfoFields, TracingHeaderFields {
  http_request_execution_context_class: string;
  http_request_execution_context_handler: string;
  http_request_execution_context_type: string;
  http_request_body: unknown;
  http_request_headers: IncomingHttpHeaders;
  http_duration_ms: number | string;
}

interface ResponseLog extends GenericLog, HttpInfoFields, TracingHeaderFields {
  http_response_execution_context_class: string;
  http_response_execution_context_handler: string;
  http_response_execution_context_type: string;
  http_response_status_code: number;
  http_response_status_phrase: string;
  http_response_headers: OutgoingHttpHeaders;
  http_response_body: unknown;
  http_duration_ms: number | string;
}

@Injectable()
export class LoggingService implements LoggerService {
  private readonly level: LoggingModuleLevel = 'info';
  private readonly NODE_ENV: string;
  private readonly isDev: boolean = false;
  private readonly logger: pino.Logger;
  private readonly excludeContentType: string[];
  private readonly formatService: FormatService;

  /* istanbul ignore next */
  constructor(
    @Inject(LOGGING_MODULE_OPTIONS) private readonly loggingOptions?: LoggerModuleOptions,
    @Inject(RedactService) private readonly redactService?: RedactService,
  ) {
    this.formatService = new FormatService();
    this.NODE_ENV = process.env.NODE_ENV;
    this.level = this.loggingOptions?.level || 'info';
    this.excludeContentType = this.loggingOptions?.excludeContentType || [];

    if (this.NODE_ENV === 'production' || this.NODE_ENV === 'test') {
      // Write straight to stdout: a `pino.multistream` entry without its own
      // `level` defaults to 'info' and silently dropped debug/trace logs.
      this.logger = pino({ level: this.level }, process.stdout);
    } else {
      this.isDev = true;
      this.logger = pino({
        level: this.level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      });
    }
  }

  public readFile<T = any>(pathSegment: string, filename: string): T {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, { encoding: 'utf8' })) as T;
  }

  // The depth from this file to the package root differs between dev
  // (src/logging/service) and the built output (logging/service), so walk up
  // instead of hardcoding "../package.json".
  // Read once: getGenericLog() runs on every log line.
  private static ownPackageJson?: { name: string; version: string };

  private readOwnPackageJson(): { name: string; version: string } {
    if (LoggingService.ownPackageJson) return LoggingService.ownPackageJson;
    let dir = import.meta.dirname;
    while (!fs.existsSync(path.resolve(dir, 'package.json'))) {
      const parent = path.dirname(dir);
      /* istanbul ignore next */
      if (parent === dir) {
        throw new Error('Could not locate the logger package.json');
      }
      dir = parent;
    }
    LoggingService.ownPackageJson = this.readFile<{ name: string; version: string }>(
      dir,
      'package.json',
    );
    return LoggingService.ownPackageJson;
  }

  /**
   * Emits a log line. `context` is placed first in the output; `stack` (or the
   * stack of an `Error` passed as `message`) is added as a `stack` field.
   */
  // `npm_package_*` only exist when the app runs through an npm/yarn script;
  // fall back to the package.json in the working directory (`node dist/main`).
  private static appPackageJson?: { name?: string; version?: string };

  private readAppPackageJson(): { name?: string; version?: string } {
    if (!LoggingService.appPackageJson) {
      const { npm_package_name: name, npm_package_version: version } = process.env;
      try {
        LoggingService.appPackageJson =
          name && version ? { name, version } : this.readFile(process.cwd(), 'package.json');
      } catch {
        LoggingService.appPackageJson = { name, version };
      }
    }
    return LoggingService.appPackageJson;
  }

  public logFn(
    logType: LoggingModuleLevel,
    message: unknown,
    context?: string,
    stack?: string,
  ): void {
    if (this.validateIfHasGenericLog(message)) {
      this.logger[logType](context ? { context, ...message } : message);
      return;
    }
    const log = this.getGenericLog(logType);
    if (message instanceof Error) {
      log.message = message.message;
      log.stack = stack ?? message.stack;
    } else {
      log.message = this.formatMessage(message);
      if (stack) log.stack = stack;
    }
    this.logger[logType](context ? { context, ...log } : log);
  }

  public log(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('info', message, LoggingService.extractContext(optionalParams));
  }

  public info(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('info', message, LoggingService.extractContext(optionalParams));
  }

  /**
   * Accepts both `error(message, context)` and Nest's
   * `error(message, stack, context)` signature (used by `Logger` once this
   * service is registered with `app.useLogger()`).
   */
  public error(message: unknown, ...optionalParams: unknown[]): void {
    const { context, stack } = LoggingService.extractContextAndStack(optionalParams);
    this.logFn('error', message, context, stack);
  }

  public warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('warn', message, LoggingService.extractContext(optionalParams));
  }

  public fatal(message: unknown, ...optionalParams: unknown[]): void {
    const { context, stack } = LoggingService.extractContextAndStack(optionalParams);
    this.logFn('fatal', message, context, stack);
  }

  public debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('debug', message, LoggingService.extractContext(optionalParams));
  }

  /** Nest's `verbose` level, mapped to pino's `trace`. */
  public verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('trace', message, LoggingService.extractContext(optionalParams));
  }

  public trace(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('trace', message, LoggingService.extractContext(optionalParams));
  }

  public silent(message: unknown, ...optionalParams: unknown[]): void {
    this.logFn('silent', message, LoggingService.extractContext(optionalParams));
  }

  /** Nest convention: the trailing string param is the context. */
  private static extractContext(optionalParams: unknown[]): string | undefined {
    const last = optionalParams[optionalParams.length - 1];
    return typeof last === 'string' ? last : undefined;
  }

  private static isStackFormat(value: unknown): value is string {
    return typeof value === 'string' && /\n[ \t]+at .+:\d+:\d+/.test(value);
  }

  private static extractContextAndStack(optionalParams: unknown[]): {
    context?: string;
    stack?: string;
  } {
    if (optionalParams.length === 1) {
      const [param] = optionalParams;
      return LoggingService.isStackFormat(param)
        ? { stack: param }
        : { context: LoggingService.extractContext(optionalParams) };
    }
    const [maybeStack] = optionalParams;
    return {
      stack: typeof maybeStack === 'string' ? maybeStack : undefined,
      context: LoggingService.extractContext(optionalParams.slice(1)),
    };
  }

  public getGenericLog(
    loggingLevel: LoggingModuleLevel,
    logType: LogType = 'DEFAULT',
    timestamp?: number,
  ): GenericLog {
    const packageInfo = this.readOwnPackageJson();
    const appInfo = this.readAppPackageJson();
    return {
      application_name: appInfo.name,
      application_version: appInfo.version,
      logger_name: packageInfo.name,
      logger_version: packageInfo.version,
      '@timestamp': this.formatService.dateToISO({
        date: new Date(timestamp ? timestamp : Date.now()),
      }),
      log_level: loggingLevel.toUpperCase(),
      log_type: logType,
    };
  }

  public addRequestLogs(
    request: Request,
    context: ExecutionContext,
    timeRequest: number,
  ): RequestLog {
    const requestLog = this.getGenericLog('info', 'REQUEST', timeRequest) as RequestLog;
    requestLog.message = 'Request executed';
    requestLog.http_request_execution_context_class = context.getClass().name;
    requestLog.http_request_execution_context_handler = context.getHandler().name;
    requestLog.http_request_execution_context_type = context.getType();
    requestLog.http_request_body = request.body;
    requestLog.http_request_headers = request.headers;
    requestLog.http_duration_ms = this.formatService.calculateTimestampDiff({
      startTime: timeRequest,
      endTime: Date.now(),
    });
    LoggingService.addHttpInfo(request, requestLog);
    LoggingService.addTracingHeaders(request, requestLog);
    return this.redactLogs(requestLog);
  }

  public addResponseLogs(
    request: Request,
    response: Response,
    body: unknown,
    context: ExecutionContext,
    timeRequest: number,
    isException: boolean,
  ): ResponseLog {
    const responseLog = this.getGenericLog('info', 'RESPONSE', Date.now()) as ResponseLog;
    responseLog.message = 'Response executed';
    responseLog.http_response_execution_context_class = context.getClass().name;
    responseLog.http_response_execution_context_handler = context.getHandler().name;
    responseLog.http_response_execution_context_type = context.getType();
    responseLog.http_response_status_code = isException
      ? LoggingService.getExceptionStatus(body)
      : response.statusCode;
    responseLog.http_response_status_phrase = HttpStatus[responseLog.http_response_status_code];
    responseLog.http_response_headers = response.getHeaders();
    /* istanbul ignore next */
    const responseContentType = String(responseLog.http_response_headers['content-type']);
    responseLog.http_response_body = !this.excludeContentType.includes(responseContentType)
      ? isException
        ? LoggingService.getExceptionBody(body)
        : body
      : `The response body was excluded because of the content-type: ${responseContentType}`;
    responseLog.http_duration_ms = this.formatService.calculateTimestampDiff({
      startTime: timeRequest,
      endTime: Date.now(),
    });
    LoggingService.addHttpInfo(request, responseLog);
    LoggingService.addTracingHeaders(request, responseLog);
    return this.redactLogs(responseLog);
  }

  private static getExceptionStatus(error: unknown): number {
    if (error instanceof HttpException) return error.getStatus();
    const { status, statusCode } = (error ?? {}) as { status?: unknown; statusCode?: unknown };
    if (typeof status === 'number') return status;
    if (typeof statusCode === 'number') return statusCode;
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  // Errors have non-enumerable `message`/`stack`, so they would serialize as `{}`.
  private static getExceptionBody(error: unknown): unknown {
    if (error instanceof HttpException) return error.getResponse();
    if (error instanceof Error) return { name: error.name, message: error.message };
    return error;
  }

  private static addHttpInfo(request: Request, jsonLog: RequestLog | ResponseLog): void {
    jsonLog.http_request_address = `${request.protocol}://${request.get('host')}${request.path}`;
    jsonLog.http_request_query_string = request.query;
    jsonLog.http_request_method = request.method;
    jsonLog.http_request_path = request.path;
    jsonLog.http_request_remote_address = request.ip;
  }

  private static addTracingHeaders(request: Request, jsonLog: RequestLog | ResponseLog): void {
    const tracingHeaderJaeger = request.headers['uber-trace-id'] as string | undefined;
    const tracingHeaderXray = request.headers['x-amzn-trace-id'] as string | undefined;
    // uber-trace-id: "{trace-id}:{span-id}:{parent-span-id}:{flags}"
    const jaegerIds: string[] = tracingHeaderJaeger ? tracingHeaderJaeger.split(':', 3) : [];
    // x-amzn-trace-id: "Root=...;Parent=...;Sampled=..."
    const xRayIds: string[] = tracingHeaderXray ? tracingHeaderXray.split(';', 3) : [];
    jsonLog['uber-trace-id'] = tracingHeaderJaeger;
    jsonLog.trace_id = jaegerIds[0] ?? '-';
    jsonLog.span_id = jaegerIds[1] ?? '-';
    jsonLog.span_parent_id = jaegerIds[2] ?? '-';
    jsonLog['x-amzn-trace-id'] = tracingHeaderXray;
    jsonLog.x_amzn_trace_id = (xRayIds[0] ?? '-').replace(/Root=/g, '');
    jsonLog.x_amzn_paren_id = (xRayIds[1] ?? '-').replace(/Parent=/g, '');
    jsonLog.x_amzn_sampled_id = (xRayIds[2] ?? '-').replace(/Sampled=/g, '');
  }

  /* Redact Logs*/
  private redactLogs<T extends RequestLog | ResponseLog>(_data: T): T {
    // `obfuscate` is a deep-clone-then-mutate helper from an untyped upstream
    // library; the result is structurally identical to the input.
    const tempData = this.redactService.obfuscate(_data) as Record<string, unknown>;

    /* istanbul ignore next */
    tempData.http_request_headers = this.isDev
      ? tempData.http_request_headers
      : JSON.stringify(tempData.http_request_headers);
    /* istanbul ignore next */
    tempData.http_request_query_string = this.isDev
      ? tempData.http_request_query_string
      : JSON.stringify(tempData.http_request_query_string);
    /* istanbul ignore next */
    tempData.http_request_body = this.isDev
      ? tempData.http_request_body
      : JSON.stringify(tempData.http_request_body);

    /* istanbul ignore next */
    tempData.http_response_headers = this.isDev
      ? tempData.http_response_headers
      : JSON.stringify(tempData.http_response_headers);
    /* istanbul ignore next */
    tempData.http_response_body = this.isDev
      ? tempData.http_response_body
      : JSON.stringify(tempData.http_response_body);

    return tempData as T;
  }

  private formatMessage(message: unknown): unknown {
    /* istanbul ignore next */
    if (this.isDev) {
      return message;
    }
    if (typeof message === 'object' && message !== null) {
      return JSON.stringify(message);
    }
    switch (typeof message) {
      case 'string':
        return message;
      case 'number':
      case 'boolean':
      case 'bigint':
      case 'symbol':
      case 'function':
        return message.toString();
      case 'undefined':
        return 'undefined';
      case 'object':
        // Only `null` can reach here; non-null objects were handled above.
        return 'null';
    }
  }

  private validateIfHasGenericLog(message: unknown): message is GenericLog {
    if (typeof message !== 'object' || message === null) {
      return false;
    }
    // `application_*` may be undefined, and `redactLogs` (JSON round-trip) drops
    // undefined keys, so they cannot be required to recognize a generic log.
    return DEFAULT_BASE_GENERIC_LOG.filter((key) => !key.startsWith('application_')).every(
      (key) => key in message,
    );
  }
}
