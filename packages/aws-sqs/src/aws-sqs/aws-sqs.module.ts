import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import {
  AwsSqsModuleAsyncOptions,
  AwsSqsModuleOptions,
  AwsSqsModuleOptionsFactory,
} from './interfaces/aws-sqs.interface.js';
import { AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS } from './constants/aws-sqs.constant.js';
import { AwsSqsService } from './services/aws-sqs.service.js';
import { AwsSqsListener } from './aws-sqs.listener.js';
import {
  createQueueProviders,
  createQueueValueProviders,
  getAwsSqsQueueToken,
} from './providers/aws-sqs.provider.js';

/**
 * AWS SQS Module for NestJS, providing services and listeners to interact with AWS SQS.
 * This module supports both synchronous and asynchronous registration and configuration.
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AWS_SQS_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService): Promise<AwsSqsModuleOptions> =>
        configService.get<AwsSqsModuleOptions>('config.sqs'),
      inject: [ConfigService],
    },
    AwsSqsService,
    AwsSqsListener,
    ...createQueueProviders(),
  ],
  exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
})
export class AwsSqsModule {
  /**
   * Registers the module with synchronous configuration.
   * @param options Configuration options for AWS SQS.
   * @returns A DynamicModule configured with the provided options.
   * @example
   * const sqsModule = AwsSqsModule.register({
   *   region: 'us-east-1',
   *   queues: [{ name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456/orders' }],
   * });
   */
  static register(options: AwsSqsModuleOptions): DynamicModule {
    return {
      module: AwsSqsModule,
      ...this.createSyncMetadata(options),
    };
  }

  /**
   * Registers the module with asynchronous configuration.
   * @param options Asynchronous configuration options for AWS SQS.
   * @returns A DynamicModule configured asynchronously.
   * @example
   * const sqsModule = AwsSqsModule.registerAsync({
   *   imports: [ConfigModule],
   *   useFactory: async (configService: ConfigService) => ({
   *     region: configService.get('AWS_REGION'),
   *     queues: [{ name: 'orders', url: configService.get('ORDERS_QUEUE_URL') }],
   *   }),
   *   inject: [ConfigService],
   * });
   */
  static registerAsync(options: AwsSqsModuleAsyncOptions): DynamicModule {
    return {
      module: AwsSqsModule,
      imports: [...(options.imports || [])],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
        AwsSqsService,
        AwsSqsListener,
        ...createQueueProviders(),
      ],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
    };
  }

  /**
   * Registers the module globally with synchronous configuration.
   * @param options Configuration options for AWS SQS.
   * @returns A globally configured DynamicModule.
   */
  static forRoot(options: AwsSqsModuleOptions): DynamicModule {
    return {
      global: true,
      module: AwsSqsModule,
      ...this.createSyncMetadata(options),
    };
  }

  /**
   * Registers the module globally with asynchronous configuration.
   * @param options Asynchronous configuration options for AWS SQS.
   * @returns A globally configured DynamicModule.
   */
  static forRootAsync(options: AwsSqsModuleAsyncOptions): DynamicModule {
    return {
      global: true,
      module: AwsSqsModule,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        ...(options.extraProviders || []),
        AwsSqsService,
        AwsSqsListener,
        ...createQueueProviders(),
      ],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
    };
  }

  /**
   * Builds the providers/exports for synchronous registration, including one injectable
   * `AWS_SQS_QUEUE_<NAME>` provider per configured queue.
   * @param options Configuration options for AWS SQS.
   */
  private static createSyncMetadata(
    options: AwsSqsModuleOptions,
  ): Pick<DynamicModule, 'providers' | 'exports'> {
    const queueTokens: string[] = (options?.queues ?? []).map((queue) =>
      getAwsSqsQueueToken(queue.name),
    );
    return {
      providers: [
        { provide: AWS_SQS_MODULE_OPTIONS, useValue: options },
        AwsSqsService,
        AwsSqsListener,
        ...createQueueProviders(),
        ...createQueueValueProviders(options?.queues),
      ],
      exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS, ...queueTokens],
    };
  }

  /**
   * Creates providers for asynchronous registration.
   * @param options Asynchronous configuration options.
   * @returns An array of providers.
   */
  private static createAsyncProviders(options: AwsSqsModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const providers: Provider<any>[] = [this.createAsyncOptionsProvider(options)];

    /* istanbul ignore next */
    if (options.useClass)
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });

    return providers;
  }

  /**
   * Creates the provider for asynchronous options.
   * @param options Asynchronous configuration options.
   * @returns A provider that resolves the module options.
   */
  private static createAsyncOptionsProvider(options: AwsSqsModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: AWS_SQS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    let inject: Type<AwsSqsModuleOptionsFactory>[];
    if (options.useExisting !== undefined) {
      inject = [options.useExisting];
    }

    if (options.useClass !== undefined && !inject) {
      inject = [options.useClass];
    }

    return {
      provide: AWS_SQS_MODULE_OPTIONS,
      useFactory: async (
        optionsFactory: AwsSqsModuleOptionsFactory,
      ): Promise<AwsSqsModuleOptions> => optionsFactory.createOptions(),
      inject,
    };
  }
}
