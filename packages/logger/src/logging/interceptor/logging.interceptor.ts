import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { excludePaths } from '@tresdoce-nestjs-toolkit/core';
import { Observable, tap } from 'rxjs';
import type { Request, Response } from 'express';

import { LoggingService } from '../service/logging.service.js';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Only HTTP requests are logged (RPC / WebSocket contexts have no req/res).
    if (context.getType() !== 'http') return next.handle();
    const timeRequest = Date.now();
    const ctx = context.switchToHttp();
    // Kept local: the interceptor is a singleton shared by concurrent requests.
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap({
        next: (body) =>
          this.logInterceptorResponse(timeRequest, context, request, response, body, false),
        error: (error) =>
          this.logInterceptorResponse(timeRequest, context, request, response, error, true),
      }),
    );
  }

  public logInterceptorResponse(
    timeRequest: number,
    context: ExecutionContext,
    request: Request,
    response: Response,
    responseBody: unknown,
    isException: boolean,
  ): void {
    const isExcluded = excludePaths().some((path) => request.path?.startsWith(path));
    if (isExcluded) return;

    // Logging must never alter the response: an error thrown here (e.g. a body
    // that cannot be serialized) would replace the handler's result/exception.
    try {
      const requestLog = this.loggingService.addRequestLogs(request, context, timeRequest);
      const responseLog = this.loggingService.addResponseLogs(
        request,
        response,
        responseBody,
        context,
        timeRequest,
        isException,
      );
      this.loggingService.log(requestLog);
      this.loggingService.log(responseLog);
    } catch (error) {
      this.loggingService.error(error, 'LoggingInterceptor');
    }
  }
}
