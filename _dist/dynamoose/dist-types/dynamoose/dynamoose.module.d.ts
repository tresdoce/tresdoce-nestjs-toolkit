import { DynamicModule } from '@nestjs/common';
import { ModelDefinition, AsyncModelFactory, DynamooseModuleAsyncOptions, DynamooseModuleOptions } from './interfaces';
export declare class DynamooseModule {
    static forRoot(options?: DynamooseModuleOptions): DynamicModule;
    static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule;
    static forFeature(models?: ModelDefinition[]): DynamicModule;
    static forFeatureAsync(factories?: AsyncModelFactory[]): DynamicModule;
}
