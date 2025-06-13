import { DynamicModule } from '@nestjs/common';
import { HttpModuleAsyncOptions, HttpModuleOptions } from './interfaces/http-module.interface';
export declare class HttpClientModule {
    static register(config: HttpModuleOptions): DynamicModule;
    static registerAsync(options: HttpModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
