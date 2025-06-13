import { DynamicModule } from '@nestjs/common';
import { RedactModuleAsyncOptions, RedactModuleOptions } from './interfaces';
export declare class RedactModule {
    static register(_options: RedactModuleOptions): DynamicModule;
    static registerAsync(_options: RedactModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
