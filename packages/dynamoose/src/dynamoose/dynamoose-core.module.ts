import { DynamicModule, Global, Logger, Module, Provider } from '@nestjs/common';
import type { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import dynamoose from 'dynamoose';
import { LoggerProvider } from './providers/dynamoose-logger.provider.js';
import {
  DynamooseModuleAsyncOptions,
  DynamooseModuleOptions,
  DynamooseOptionsFactory,
} from './interfaces/index.js';

import {
  DYNAMOOSE_INITIALIZATION,
  DYNAMOOSE_LOCAL_ENDPOINT,
  DYNAMOOSE_MODULE_OPTIONS,
} from './constants/dynamoose.constant.js';

export function buildDynamoDBClientConfig(
  aws: DynamooseModuleOptions['aws'] = {},
  endpoint?: string,
): DynamoDBClientConfig {
  const { accessKeyId, secretAccessKey, region } = aws;
  return {
    ...(region && { region }),
    ...(accessKeyId && secretAccessKey && { credentials: { accessKeyId, secretAccessKey } }),
    ...(endpoint && { endpoint }),
  };
}

/** `local: true` uses the default DynamoDB Local endpoint; a string is used as is. */
const resolveLocalEndpoint = (local: DynamooseModuleOptions['local']): string | undefined => {
  if (typeof local === 'string') return local;
  return local ? DYNAMOOSE_LOCAL_ENDPOINT : undefined;
};

export async function initialization(options?: DynamooseModuleOptions): Promise<void> {
  if (!options) return;

  const endpoint = resolveLocalEndpoint(options.local);

  if (options.ddb) {
    dynamoose.aws.ddb.set(options.ddb);
    // Se respeta el comportamiento de dynamoose: `local` reemplaza el cliente por uno apuntando al endpoint.
    if (endpoint) dynamoose.aws.ddb.local(endpoint);
  } else if (options.aws || endpoint) {
    dynamoose.aws.ddb.set(
      new dynamoose.aws.ddb.DynamoDB(buildDynamoDBClientConfig(options.aws, endpoint)),
    );
  }

  if (options.table) {
    dynamoose.Table.defaults.set(options.table);
  }

  /* istanbul ignore next */
  if (options.logger) {
    (await dynamoose.logger()).providers.add(
      new LoggerProvider(
        typeof options.logger === 'boolean' ? new Logger('DynamooseModule') : options.logger,
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
      useFactory: (dynamooseModuleOptions: DynamooseModuleOptions) =>
        initialization(dynamooseModuleOptions),
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
