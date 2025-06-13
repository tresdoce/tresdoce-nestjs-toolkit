import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { HttpClientService } from '../services/httpClient.service';
export declare class HttpClientInterceptor<T> implements NestInterceptor<T, any> {
    private readonly httpService;
    constructor(httpService: HttpClientService);
    intercept(_context: ExecutionContext, _next: CallHandler): Observable<any> | Promise<Observable<any>>;
}
