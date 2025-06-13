import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    private configService;
    constructor(configService: ConfigService);
    intercept(_context: ExecutionContext, _next: CallHandler): Observable<any>;
}
