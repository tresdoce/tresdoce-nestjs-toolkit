import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
export declare class ExceptionsFilter<T> implements ExceptionFilter {
    private readonly appConfig;
    constructor(appConfig: Typings.AppConfig);
    catch(_exception: T, _host: ArgumentsHost): void;
}
