import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ElkService } from '../services/elk.service';
export declare class ElkInterceptor<T> implements NestInterceptor<T, any> {
    private readonly elkService;
    private ctx;
    private request;
    private response;
    constructor(elkService: ElkService);
    intercept(_context: ExecutionContext, _next: CallHandler): Observable<any>;
}
