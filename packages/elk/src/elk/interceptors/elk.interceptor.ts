import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ElkService } from '../services/elk.service.js';

@Injectable()
export class ElkInterceptor<T = any> implements NestInterceptor<T, any> {
  constructor(private readonly elkService: ElkService) {}

  intercept(_context: ExecutionContext, _next: CallHandler<T>): Observable<any> {
    const timeRequest = Date.now();

    return _next.handle().pipe(
      tap({
        next: (_response): void => this.serialize(timeRequest, _context, _response, false),
        error: (_error): void => this.serialize(timeRequest, _context, _error, true),
      }),
    );
  }

  /*
   * Fire-and-forget: la indexación nunca debe afectar la respuesta ni generar
   * unhandled rejections.
   */
  private serialize(
    _timeRequest: number,
    _context: ExecutionContext,
    _payload: any,
    _isException: boolean,
  ): void {
    this.elkService
      .serializeResponseInterceptor(_timeRequest, _context, _payload, _isException)
      .catch((_error: Error): void => {
        Logger.error(`Serialize response: ${_error.message}`, 'ElkInterceptor');
      });
  }
}
