import { DynamicModule, flatten, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { DynamooseCoreModule } from './dynamoose-core.module';
import {
  createDynamooseAsyncProviders,
  createDynamooseProviders,
} from './providers/dynamoose.provider';
import {
  ModelDefinition,
  AsyncModelFactory,
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
} from './interfaces';

import { DYNAMOOSE_OPTIONS } from './constants/dynamoose.constant';

@Global()
@Module({
  imports: [
    ConfigModule,
    DynamooseCoreModule.forRootAsync({
      useFactory: async (options: DynamooseModuleOptions): Promise<DynamooseModuleOptions> =>
        options,
      inject: [DYNAMOOSE_OPTIONS],
    }),
  ],
  providers: [
    {
      provide: DYNAMOOSE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<DynamooseModuleOptions> =>
        configService.get<DynamooseModuleOptions>('config.dynamodb'),
      inject: [ConfigService],
    },
  ],
  exports: [DynamooseCoreModule, DYNAMOOSE_OPTIONS],
})
export class DynamooseModule {
  static forRoot(options: DynamooseModuleOptions = {}): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule {
    return {
      module: DynamooseModule,
      imports: [DynamooseCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(models: ModelDefinition[] = []): DynamicModule {
    const providers = createDynamooseProviders(models);
    return {
      module: DynamooseModule,
      providers: providers,
      exports: providers,
    };
  }

  static forFeatureAsync(factories: AsyncModelFactory[] = []): DynamicModule {
    const providers = createDynamooseAsyncProviders(factories);
    const imports = factories.map((factory) => factory.imports || []);
    const uniqImports = new Set(flatten(imports));
    return {
      module: DynamooseModule,
      imports: [...uniqImports],
      providers: providers,
      exports: providers,
    };
  }
}
