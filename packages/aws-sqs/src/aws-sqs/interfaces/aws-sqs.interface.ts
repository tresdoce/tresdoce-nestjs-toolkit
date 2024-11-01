import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { SQSClientConfig, MessageAttributeValue } from '@aws-sdk/client-sqs';

/**
 * Configuration options for the AWS SQS Module.
 * Extends the `SQSClientConfig` from the AWS SDK to include an array of queue configurations.
 */
export interface AwsSqsModuleOptions extends SQSClientConfig {
  /** An array of queue configurations. */
  queues: QueueConfig[];
}

/**
 * Configuration for a specific AWS SQS queue.
 */
export interface QueueConfig {
  /** The logical name of the queue. */
  name: string;

  /** The URL of the queue. */
  url: string;

  /** Optional attributes for the queue. */
  attributes?: Record<string, string>;
}

/**
 * A factory interface for generating the AWS SQS module options.
 * Implement this interface when custom logic is needed to create the module options.
 */
export interface AwsSqsModuleOptionsFactory {
  /**
   * Creates the configuration options for the AWS SQS module.
   * @returns A promise or an object containing the module options.
   * @example
   * class SqsConfigService implements AwsSqsModuleOptionsFactory {
   *   async createOptions(): Promise<AwsSqsModuleOptions> {
   *     return {
   *       region: 'us-east-1',
   *       queues: [{ name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456/orders' }],
   *     };
   *   }
   * }
   */
  createOptions(): Promise<AwsSqsModuleOptions> | AwsSqsModuleOptions;
}

/**
 * Asynchronous options for registering the AWS SQS Module.
 * Allows dynamic imports and the use of factories or classes to generate configuration options.
 */
export interface AwsSqsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * A reference to an existing service that implements `AwsSqsModuleOptionsFactory`.
   */
  useExisting?: Type<AwsSqsModuleOptionsFactory>;

  /**
   * A class that implements `AwsSqsModuleOptionsFactory` to generate the module options.
   */
  useClass?: Type<AwsSqsModuleOptionsFactory>;

  /**
   * A factory function to create the module options dynamically.
   * @param args The arguments injected into the factory function.
   */
  useFactory?: (...args: any[]) => Promise<AwsSqsModuleOptions> | AwsSqsModuleOptions;

  /**
   * An array of providers to inject into the factory function.
   */
  inject?: any[];

  /** Additional modules to import. */
  imports?: ModuleMetadata['imports'];

  /** Optional extra providers to register in the module. */
  extraProviders?: Provider[];
}

/**
 * Options for sending a message to an AWS SQS queue.
 */
export interface SendMessageOptions {
  /** The logical name of the queue to send the message to. */
  queueName: string;

  /** The body of the message, either as a string or an object. */
  messageBody: string | object;

  /** Optional delay (in seconds) before the message is sent. */
  delaySeconds?: number;

  /** Optional message attributes to include with the message. */
  messageAttributes?: Record<string, MessageAttributeValue>;

  /** Optional group ID for FIFO queues to group related messages. */
  groupId?: string;

  /** Optional deduplication ID for FIFO queues to ensure message uniqueness. */
  deduplicationId?: string;
}
