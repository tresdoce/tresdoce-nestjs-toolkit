import { DynamicModule } from '@nestjs/common';
import { DynamooseModuleAsyncOptions, DynamooseModuleOptions } from './interfaces';
export declare class DynamooseCoreModule {
    static forRoot(options?: DynamooseModuleOptions): DynamicModule;
    static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule;
    private static createAsyncProviders;
    private static createAsyncOptionsProvider;
}
