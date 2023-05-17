import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Observable, tap } from 'rxjs';
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
      tap({
        next: async (_response): Promise<void> => {
          await this.elkService.serializeResponseInterceptor(
            timeRequest,
            _context,
            _response,
            false,
          );
        },
        error: async (_error): Promise<void> => {
          await this.elkService.serializeResponseInterceptor(timeRequest, _context, _error, true);
        },
      }),
    );
  }
}
