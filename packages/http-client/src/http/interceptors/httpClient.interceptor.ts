import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Scope } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';
import { Request } from 'express';

import { HttpClientService } from '../services/httpClient.service';

@Injectable({ scope: Scope.REQUEST })
export class HttpClientInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly httpService: HttpClientService) {}

  intercept(
    _context: ExecutionContext,
    _next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const ctx: HttpArgumentsHost = _context.switchToHttp();
    const request: Request = ctx.getRequest<Request>();

    this.httpService.initAxios(request);

    return _next.handle();
  }
}
