import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable, tap, mergeMap, catchError } from 'rxjs';
import { Request, Response } from 'express';
import { ElkService } from '../services/elk.service';

@Injectable()
export class ElkInterceptor<T> implements NestInterceptor<T, any> {
  private ctx: HttpArgumentsHost;
  private request: Request;
  private response: Response;

  constructor(private readonly elkService: ElkService) {}

  intercept(_context: ExecutionContext, _next: CallHandler): Observable<any> {
    const timeRequest = Date.now();
    this.ctx = _context.switchToHttp();
    this.request = this.ctx.getRequest<Request>();
    this.response = this.ctx.getResponse<Response>();

    return _next.handle().pipe(
      mergeMap(async (_response) => {
        await this.elkService.serializeResponseInterceptor(timeRequest, _context, _response, false);
        return _response;
      }),
      catchError(async (_error) => {
        await this.elkService.serializeResponseInterceptor(timeRequest, _context, _error, true);
        return _error;
      }),
    );
  }
}
