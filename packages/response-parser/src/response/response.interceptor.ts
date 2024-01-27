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

    /*const page = Number(request.query.page);
    const size = Number(request.query.size);
    const hasPagination = page != null && size != null;
    console.log("page: ", page)
    console.log("size: ", size)
    console.log("hasPagination: ", hasPagination)*/

    /*return _next.handle().pipe(
      map((res) => {

        const { pagination, data } = res;
        const totalPages = Math.ceil(pagination.total / size);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        return hasPagination ? {
          ...(_.isArray(res.data) ? { data: res.data } : res.data),
          meta: {
            page,
            size,
            total: pagination.total,
            totalPages,
            hasNext,
            hasPrevious
          }
        } : (_.isArray(res) ? { data: res } : res);
      }),
    );*/

    return _next.handle().pipe(
      map((res) => {
        return _.isArray(res) ? { data: res } : res;
      }),
    );
  }
}
