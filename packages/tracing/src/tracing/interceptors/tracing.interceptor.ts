import {
  CallHandler,
  ContextType,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Observable, tap } from 'rxjs';
import { Span } from '@opentelemetry/api';
import { Request, Response } from 'express';
import * as _ from 'lodash';

import { TracingService } from '../services/tracing.service';
import {
  defaultExcludePaths,
  SKIP_TRACE,
  REQUEST_RECEIVED,
  RESPONSE_RECEIVED,
} from '../constants/tracing.constant';
import * as Tags from '../constants/tags.constant';

@Injectable({ scope: Scope.REQUEST })
export class TracingInterceptor implements NestInterceptor {
  private url: string;
  private span: Span;
  private reflector: Reflector = new Reflector();
  private ctx: HttpArgumentsHost;
  private request: Request;
  private response: Response;

  constructor(
    private readonly tracingService: TracingService,
    private configService: ConfigService,
  ) {}

  intercept(
    _context: ExecutionContext,
    _next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const appContext = this.configService.get('config.server.context');
    const excludePaths = _.map(defaultExcludePaths, (_item) => `/${appContext}${_item}`);

    const timeRequest: number = Date.now();
    const skipTrace: boolean = this.reflector.get<boolean>(SKIP_TRACE, _context.getHandler());

    if (skipTrace) return _next.handle();

    const contextType: ContextType = _context.getType();
    const controller: string = _context.getClass().name;
    const handler: string = _context.getHandler().name;
    const operation: string = [contextType, controller, handler].join(':');

    this.ctx = _context.switchToHttp();
    this.request = this.ctx.getRequest();
    this.response = this.ctx.getResponse();

    if (excludePaths.includes(this.request.path)) return _next.handle();

    /* istanbul ignore next */
    this.url = this.request.path === '/' ? `${this.request.headers.host}` : `${this.request.path}`;
    const parentSpanContext = this.tracingService.getParentSpanOptions(this.request.headers);

    this.span = this.tracingService.startActiveSpan(this.url, parentSpanContext);
    this.span.setAttributes({
      [Tags.TIMESTAMP]: timeRequest,
      [Tags.TIME_START]: this.tracingService.formatDate(timeRequest),
      [Tags.HTTP_OPERATION]: operation,
      [Tags.HTTP_CONTROLLER]: controller,
      [Tags.HTTP_HANDLER]: handler,
      [Tags.COMPONENT]: contextType,
      [Tags.SPAN_KIND]: Tags.SPAN_KIND_MESSAGING_PRODUCER,
      [Tags.HTTP_METHOD]: this.request.method,
      [Tags.HTTP_URL]: this.url,
    });

    this.span.addEvent(REQUEST_RECEIVED);
    const responseHeaders = {};
    this.tracingService.setSpanContext(responseHeaders);
    this.response.set(responseHeaders);
    Object.assign(this.request, { span: this.span });

    /* istanbul ignore next */
    if (!this.span) return _next.handle();
    this.tracingService.propagateSpanContext(this.request.headers);
    this.tracingService.setSpanTags(this.span, this.request.headers);
    this.tracingService.setSpanContext(this.request.headers);
    return _next.handle().pipe(
      tap(() => {
        this.span.setAttributes({
          [Tags.HTTP_STATUS_CODE]: this.response.statusCode,
          [Tags.TIME_END]: this.tracingService.formatDate(Date.now()),
          [Tags.TIME_DURATION]: this.tracingService.generateDuration(timeRequest, Date.now()),
        });
        this.span.addEvent(RESPONSE_RECEIVED);
        this.span.end();
      }),
    );
  }
}
