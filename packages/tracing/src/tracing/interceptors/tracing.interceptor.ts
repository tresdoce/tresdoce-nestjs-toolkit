import { Reflector } from '@nestjs/core';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { Span } from '@opentelemetry/api';
import { HttpArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { TracingService } from '../services/tracing.service';
import { EXCEPT_TRACING_INTERCEPTOR } from '../constants/tracing.constant';
import * as Tags from '../constants/tags.constant';

@Injectable({ scope: Scope.REQUEST })
export class TracingInterceptor implements NestInterceptor {
  private url: string;
  private span: Span;
  private reflector: Reflector = new Reflector();
  private ctx: HttpArgumentsHost;
  private request: Request;
  private response: Response;

  constructor(private readonly tracingService: TracingService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const except = this.reflector.get<boolean>(EXCEPT_TRACING_INTERCEPTOR, context.getHandler());
    /* istanbul ignore next */
    if (except) return next.handle();

    const contextType = `${context.getType()}`;
    const constructorRef = `${context.getClass().name}`;
    const handlerRef = `${context.getHandler().name}`;
    const operation = [contextType, constructorRef, handlerRef].join(':');

    this.ctx = context.switchToHttp();
    this.request = this.ctx.getRequest();
    this.response = this.ctx.getResponse();

    /* istanbul ignore next */
    this.url = this.request.path === '/' ? `${this.request.headers.host}` : `${this.request.path}`;
    const parentSpanContext = this.tracingService.getParentSpanOptions(this.request.headers);

    this.span = this.tracingService.startActiveSpan(this.url, parentSpanContext);
    this.span.setAttributes({
      operation,
      controller: constructorRef,
      handler: handlerRef,
      [Tags.COMPONENT]: contextType,
      [Tags.SPAN_KIND]: Tags.SPAN_KIND_MESSAGING_PRODUCER,
      [Tags.HTTP_METHOD]: this.request.method,
      [Tags.HTTP_URL]: this.url,
    });

    this.span.addEvent('request_received');
    const responseHeaders = {};
    this.tracingService.setSpanContext(responseHeaders);
    this.response.set(responseHeaders);
    Object.assign(this.request, { span: this.span });

    /* istanbul ignore next */
    if (!this.span) return next.handle();
    this.tracingService.propagateSpanContext(this.request.headers);
    this.tracingService.setSpanTags(this.span, this.request.headers);
    this.tracingService.setSpanContext(this.request.headers);
    return next.handle().pipe(
      tap(() => {
        this.span.setAttribute(Tags.HTTP_STATUS_CODE, this.response.statusCode);
        this.span.addEvent('response_received');
        this.span.end();
      }),
    );
  }
}
