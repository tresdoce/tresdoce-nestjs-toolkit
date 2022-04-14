import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import * as _ from 'lodash';

import { excludePaths } from '../constants/logging.constants';
import { LoggingService } from '../service/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private request: Request;
  private response: Response;
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const timeRequest = Date.now();
    const ctx: HttpArgumentsHost = context.switchToHttp();
    this.request = ctx.getRequest<Request>();
    this.response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap((response) => {
        this.logInterceptorResponse(timeRequest, context, this.request, this.response, response);
      }),
    );
  }

  public logInterceptorResponse(
    timeRequest: number,
    context: ExecutionContext,
    request: Request,
    response: Response,
    responseBody: any,
  ): void {
    if (_.isUndefined(excludePaths.find((path) => _.startsWith(request.path, path)))) {
      const requestDuration = Date.now() - timeRequest;
      const requestLog = this.loggingService.addRequestLogs(
        request,
        context,
        timeRequest,
        requestDuration,
      );
      const responseLog = this.loggingService.addResponseLogs(
        request,
        response,
        responseBody,
        timeRequest,
        requestDuration,
      );
      this.loggingService.log(requestLog);
      this.loggingService.log(responseLog);
    }
  }
}
