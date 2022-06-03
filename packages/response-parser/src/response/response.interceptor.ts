import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(_context: ExecutionContext, _next: CallHandler): Observable<any> {
    return _next.handle().pipe(
      map((res) => {
        return _.isArray(res) ? { data: res } : res;
      }),
    );
  }
}
