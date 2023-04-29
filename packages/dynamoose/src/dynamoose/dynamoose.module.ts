import { DynamicModule, flatten, Global, Module } from '@nestjs/common';
import { DynamooseCoreModule } from './dynamoose-core.module';
import {
  createDynamooseAsyncProviders,
  createDynamooseProviders,
} from './providers/dynamoose.provider';
import { ModelDefinition } from './interfaces';
import {
  AsyncModelFactory,
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
} from './interfaces';

@Global()
@Module({})
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
