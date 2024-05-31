import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import _ from 'lodash';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private configService: ConfigService) {}

  intercept(_context: ExecutionContext, _next: CallHandler): Observable<any> {
    const ctx: HttpArgumentsHost = _context.switchToHttp();
    const request: Request = ctx.getRequest<Request>();
    const response: Response = ctx.getResponse<Response>();
    const propagateHeadersList = this.configService.get('config.server.propagateHeaders') || [];

    for (const propagateHeader of propagateHeadersList) {
      const headerName = propagateHeader.trim().toLowerCase();
      if (request.headers[headerName]) {
        response.setHeader(headerName, request.headers[headerName]);
      }
    }

    return _next.handle().pipe(
      map((_res) => {
        return _.isArray(_res) ? { data: _res } : _res;
      }),
    );
  }
}
