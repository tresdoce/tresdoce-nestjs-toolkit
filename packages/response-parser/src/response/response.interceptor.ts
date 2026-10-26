import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Request, Response } from 'express';

/**
 * Respuesta transformada por el interceptor: los arrays se envuelven en `{ data }`,
 * cualquier otro valor se devuelve sin cambios.
 */
export type ParsedResponse<T> = T extends readonly unknown[] ? { data: T } : T;

@Injectable()
export class ResponseInterceptor<T = any> implements NestInterceptor<T, ParsedResponse<T>> {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ParsedResponse<T>> {
    // Los headers sólo existen en contextos HTTP (en RPC/WS/GraphQL no hay request de Express).
    if (context.getType() === 'http') {
      this.propagateHeaders(context);
    }

    return next
      .handle()
      .pipe(map((res) => (Array.isArray(res) ? { data: res } : res) as ParsedResponse<T>));
  }

  private getPropagateHeaders(): string[] {
    const value = this.configService.get<string[] | string>('config.server.propagateHeaders');
    if (typeof value === 'string') return value.split(',');
    return Array.isArray(value) ? value : [];
  }

  private propagateHeaders(context: ExecutionContext): void {
    const propagateHeadersList = this.getPropagateHeaders();
    if (propagateHeadersList.length === 0) return;

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    for (const propagateHeader of propagateHeadersList) {
      const headerName = `${propagateHeader}`.trim().toLowerCase();
      const headerValue = headerName ? request.headers[headerName] : undefined;
      if (headerValue) {
        response.setHeader(headerName, headerValue);
      }
    }
  }
}
