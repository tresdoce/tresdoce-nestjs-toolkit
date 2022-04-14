import {
  DynamicModule,
  Global,
  Inject,
  Module,
  OnModuleDestroy,
  OnModuleInit,
  Provider,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { UnknownElementException } from '@nestjs/core/errors/exceptions/unknown-element.exception';
import { Connection } from 'rhea-promise';

import { AMQP_MODULE_OPTIONS } from './constants/amqp.constants';
import { ConsumerMetadata } from './domain/consumer-metadata.domain';
import { ConsumerExplorer } from './explorers/consumer.explorer';
import { AMQPModuleAsyncOptions, AMQPModuleOptions } from './interfaces/amqp.interfaces';
import { AMQPService } from './services/amqp.service';
import { ConsumerService } from './services/consumer.service';
import { ProducerService } from './services/producer.service';
import { getConnectionToken } from './utils/amqp.utils';

@Global()
@Module({
  providers: [AMQPService],
  exports: [AMQPService],
})
export class AMQPModule implements OnModuleInit, OnModuleDestroy {
  private readonly connectionToken: string;

  constructor(
    @Inject(AMQP_MODULE_OPTIONS)
    private readonly options: AMQPModuleOptions,
    private readonly consumerService: ConsumerService,
    private readonly consumerExplorer: ConsumerExplorer,
    private readonly moduleRef: ModuleRef,
  ) {
    this.connectionToken = getConnectionToken(this.options);
  }

  public async onModuleInit(): Promise<void> {
    const consumers = this.consumerExplorer.explore(this.connectionToken);
    await this.attachConsumers(consumers);
  }

  private async attachConsumers(consumers: ConsumerMetadata[]): Promise<void> {
    for (const consumer of consumers) {
      const { source, callbackName, target, targetName, callback } = consumer;
      // this.logger.silly(`Attaching @Consumer(${source}): ${callbackName}`);
      //console.log(`Attaching @Consumer(${source}): ${callbackName}`);
      let targetProcess: unknown;
      try {
        targetProcess = this.moduleRef.get(target, { strict: false });
      } catch (error) {
        if (error instanceof UnknownElementException) {
          targetProcess = this.moduleRef.get(targetName, { strict: false });
        } else {
          throw error;
        }
      }
      await this.consumerService.consume(consumer, callback.bind(targetProcess));
    }
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      const connection = this.moduleRef.get<Connection>(this.connectionToken);
      await connection?.close();
    } catch (error) {
      const { message } = error as Error;
      // this.logger.error(`Connection error: ${this.connectionToken}`, message);
      //console.log(`Connection error: ${this.connectionToken}`, message);
    }
  }

  public static forRoot(options?: AMQPModuleOptions): DynamicModule {
    const connectionProvider = this.createConnectionProvider(options);
    const moduleOptionsProvider = this.createModuleOptionsProvider(options);
    return {
      global: true,
      module: AMQPModule,
      providers: [
        connectionProvider,
        moduleOptionsProvider,
        ProducerService,
        ConsumerService,
        ConsumerExplorer,
        DiscoveryService,
        MetadataScanner,
      ],
      exports: [connectionProvider, ProducerService, ConsumerService],
    };
  }

  public static forRootAsync(options?: AMQPModuleAsyncOptions): DynamicModule {
    const connectionProvider = this.createAsyncConnectionProvider(options);
    return {
      global: true,
      module: AMQPModule,
      imports: [ConfigModule],
      providers: [
        connectionProvider,
        {
          provide: AMQP_MODULE_OPTIONS,
          useFactory: async (configService: ConfigService) =>
            configService.get('config.artemisConfig'),
          inject: [ConfigService],
        },
        ProducerService,
        ConsumerService,
        ConsumerExplorer,
        DiscoveryService,
        MetadataScanner,
      ],
      exports: [connectionProvider, ProducerService, ConsumerService],
    };
  }

  /**
   * @param options - module options
   * @returns connection provider
   */
  private static createConnectionProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: async (): Promise<Connection> => await this.createConnectionFactory(options),
    };
  }

  /**
   * @param options - module options
   * @returns AMQP connection
   */
  private static async createConnectionFactory(options: AMQPModuleOptions): Promise<Connection> {
    return AMQPService.createConnection(options);
  }

  /**
   * @param options - module options
   * @returns module options provider
   */
  private static createModuleOptionsProvider(options: AMQPModuleOptions): Provider {
    return {
      provide: AMQP_MODULE_OPTIONS,
      useValue: options,
    };
  }

  /**
   * @param options - module async options
   * @returns `Provider`
   */
  private static createAsyncConnectionProvider(options?: AMQPModuleAsyncOptions): Provider {
    return {
      provide: getConnectionToken(options),
      useFactory: async (amqpModuleOptions: AMQPModuleOptions): Promise<Connection> => {
        if (options) {
          return await this.createConnectionFactory({
            ...amqpModuleOptions,
            name: options.name,
          });
        }
        return await this.createConnectionFactory(amqpModuleOptions);
      },
      inject: [AMQP_MODULE_OPTIONS],
    };
  }
}
