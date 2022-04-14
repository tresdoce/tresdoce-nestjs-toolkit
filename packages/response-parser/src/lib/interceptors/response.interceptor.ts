import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Request, Response } from 'express';
import * as _ from 'lodash';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    return next.handle().pipe(
      map((data) => ({
        meta: {
          url: request.url,
          method: request.method,
          status: response.statusCode,
        },
        data:
          _.has(data, 'meta') && _.has(data, 'data') && _.has(data, 'errors') ? data.data : data,
        errors: [],
      })),
    );
  }
}
