import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { TracingService } from '../services/tracing.service';
export declare class TracingInterceptor implements NestInterceptor {
    private readonly tracingService;
    private configService;
    private url;
    private span;
    private reflector;
    private ctx;
    private request;
    private response;
    constructor(tracingService: TracingService, configService: ConfigService);
    intercept(_context: ExecutionContext, _next: CallHandler): Observable<any> | Promise<Observable<any>>;
}
