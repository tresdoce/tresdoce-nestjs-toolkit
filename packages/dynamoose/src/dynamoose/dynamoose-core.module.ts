import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import { aws, logger, Table } from 'dynamoose';
import { DynamooseModule } from './dynamoose.module';
import { LoggerProvider } from './providers/dynamoose-logger.provider';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
  DynamooseOptionsFactory,
} from './interfaces';

import { DYNAMOOSE_INITIALIZATION, DYNAMOOSE_MODULE_OPTIONS } from './constants/dynamoose.constant';

async function initialization(options: DynamooseModuleOptions): Promise<void> {
  if (options.ddb) {
    aws.ddb.set(options.ddb);
  } else if (options.aws) {
    aws.ddb.set(new aws.ddb.DynamoDB(options.aws));
  }

  if (options.local) {
    if (typeof options.local === 'boolean') {
      aws.ddb.local();
    } else {
      aws.ddb.local(options.local);
    }
  }

  if (options.table) {
    Table.defaults.set(options.table);
  }

  /* istanbul ignore next */
  if (options.logger) {
    (await logger()).providers.add(
      new LoggerProvider(
        typeof options.logger === 'boolean' ? new Logger(DynamooseModule.name) : options.logger,
      ),
    );
  }
}

@Global()
@Module({})
export class DynamooseCoreModule {
  /* istanbul ignore next */
  static forRoot(options: DynamooseModuleOptions = {}): DynamicModule {
    const initialProvider = {
      provide: DYNAMOOSE_INITIALIZATION,
      useFactory: () => initialization(options),
    };
    return {
      module: DynamooseCoreModule,
      providers: [initialProvider],
      exports: [initialProvider],
    };
  }

  static forRootAsync(options: DynamooseModuleAsyncOptions): DynamicModule {
    const initialProvider = {
      provide: DYNAMOOSE_INITIALIZATION,
      useFactory: (dynamoooseModuleOptions: DynamooseModuleOptions) =>
        initialization(dynamoooseModuleOptions),
      inject: [DYNAMOOSE_MODULE_OPTIONS],
    };

    const asyncProviders = this.createAsyncProviders(options);
    return {
      module: DynamooseCoreModule,
      imports: options.imports,
      providers: [...asyncProviders, initialProvider],
      exports: [initialProvider],
    };
  }

  private static createAsyncProviders(options: DynamooseModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    /* istanbul ignore next */
    //const useClass = options.useClass as Type<DynamooseOptionsFactory>;
    const useClass = options.useClass;
    /* istanbul ignore next */
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(options: DynamooseModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: DYNAMOOSE_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    /* istanbul ignore next */
    //const inject = [(options.useClass || options.useExisting) as Type<DynamooseOptionsFactory>];
    const inject = [options.useClass || options.useExisting];
    /* istanbul ignore next */
    return {
      provide: DYNAMOOSE_MODULE_OPTIONS,
      useFactory: async (optionsFactory: DynamooseOptionsFactory) =>
        await optionsFactory.createDynamooseOptions(),
      inject,
    };
  }
}
