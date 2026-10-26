import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { finalize, Observable, tap } from 'rxjs';
import { SpanStatusCode } from '@opentelemetry/api';
import type { Request, Response } from 'express';

import { TracingService } from '../services/tracing.service.js';
import { REQUEST_RECEIVED, RESPONSE_RECEIVED, SKIP_TRACE } from '../constants/tracing.constant.js';
import * as Tags from '../constants/tags.constant.js';
import { buildIgnorePaths, isPathIgnored } from '../utils/tracing.util.js';

/** Normalizes anything thrown by a handler into an `Error` for the span. */
const toError = (value: unknown): Error => {
  if (value instanceof Error) return value;
  return new Error(typeof value === 'string' ? value : JSON.stringify(value));
};

@Injectable({ scope: Scope.REQUEST })
export class TracingInterceptor implements NestInterceptor {
  constructor(
    private readonly tracingService: TracingService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  intercept(_context: ExecutionContext, _next: CallHandler): Observable<any> {
    const skipTrace = this.reflector.getAllAndOverride<boolean>(SKIP_TRACE, [
      _context.getHandler(),
      _context.getClass(),
    ]);
    if (skipTrace || _context.getType() !== 'http') return _next.handle();

    const ctx = _context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const ignorePaths = buildIgnorePaths(
      this.configService.get<string[]>('config.tracing.ignorePaths'),
    );
    if (isPathIgnored(request.path, ignorePaths)) return _next.handle();

    const timeRequest = Date.now();
    const contextType = _context.getType();
    const controller = _context.getClass().name;
    const handler = _context.getHandler().name;
    const operation = [contextType, controller, handler].join(':');
    const url = request.path === '/' ? `${request.headers.host}` : request.path;

    const span = this.tracingService.startSpan(
      url,
      undefined,
      this.tracingService.getParentContext(request.headers),
    );
    span.setAttributes({
      [Tags.TIMESTAMP]: timeRequest,
      [Tags.TIME_START]: this.tracingService.formatDate(timeRequest),
      [Tags.HTTP_OPERATION]: operation,
      [Tags.HTTP_CONTROLLER]: controller,
      [Tags.HTTP_HANDLER]: handler,
      [Tags.COMPONENT]: contextType,
      [Tags.SPAN_KIND]: Tags.SPAN_KIND_MESSAGING_PRODUCER,
      [Tags.HTTP_METHOD]: request.method,
      [Tags.HTTP_URL]: url,
    });
    span.addEvent(REQUEST_RECEIVED);

    const responseHeaders: Record<string, string> = {};
    this.tracingService.setSpanContext(responseHeaders);
    response.set(responseHeaders);
    Object.assign(request, { span });

    this.tracingService.propagateSpanContext(request.headers);
    this.tracingService.setSpanTags(span, request.headers);
    this.tracingService.setSpanContext(request.headers);

    let statusCode: number;
    return _next.handle().pipe(
      tap({
        error: (_error: unknown) => {
          statusCode =
            _error instanceof HttpException ? _error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const error = toError(_error);
          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
          span.setAttribute(Tags.ERROR, true);
        },
      }),
      finalize(() => {
        const timeEnd = Date.now();
        span.setAttributes({
          [Tags.HTTP_STATUS_CODE]: statusCode ?? response.statusCode,
          [Tags.TIME_END]: this.tracingService.formatDate(timeEnd),
          [Tags.TIME_DURATION]: this.tracingService.generateDuration(timeRequest, timeEnd),
        });
        span.addEvent(RESPONSE_RECEIVED);
        span.end();
      }),
    );
  }
}
