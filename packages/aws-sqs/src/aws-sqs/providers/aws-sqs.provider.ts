import { Provider } from '@nestjs/common';

import { AwsSqsModuleOptions, QueueConfig } from '../interfaces/aws-sqs.interface';
import {
  AWS_SQS_MODULE_OPTIONS,
  AWS_SQS_QUEUE,
  AWS_SQS_QUEUE_PROVIDERS,
} from '../constants/aws-sqs.constant';

/**
 * Factory function to create providers for AWS SQS queues.
 * This function uses the `AWS_SQS_MODULE_OPTIONS` configuration to dynamically map
 * each queue into a NestJS provider. The resulting providers can be injected
 * into other parts of the application by their unique identifiers.
 *
 * @returns An array of NestJS providers for the configured SQS queues.
 *
 * @example
 * // AWS SQS Module Configuration
 * const sqsOptions = {
 *   region: 'us-east-1',
 *   queues: [
 *     { name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456/orders' },
 *     { name: 'notifications', url: 'https://sqs.us-east-1.amazonaws.com/123456/notifications' },
 *   ],
 * };
 *
 * // Providers created by this function
 * [
 *   { provide: 'AWS_SQS_QUEUE_ORDERS', useValue: { name: 'orders', url: 'https://sqs...' } },
 *   { provide: 'AWS_SQS_QUEUE_NOTIFICATIONS', useValue: { name: 'notifications', url: 'https://sqs...' } },
 * ];
 *
 * @example
 * // Injecting a queue into a service
 * import { Inject, Injectable } from '@nestjs/common';
 * import { QueueConfig } from '../interfaces/aws-sqs.interface';
 *
 * @Injectable()
 * export class OrdersService {
 *   constructor(
 *     @Inject('AWS_SQS_QUEUE_ORDERS') private readonly ordersQueue: QueueConfig,
 *   ) {}
 *
 *   getQueueUrl(): string {
 *     return this.ordersQueue.url;
 *   }
 * }
 */
export const createQueueProviders = (): Provider[] => [
  {
    provide: AWS_SQS_QUEUE_PROVIDERS,
    /**
     * Factory function that transforms the list of SQS queues into an array of NestJS providers.
     * Each queue is provided with a unique identifier based on its name.
     *
     * @param options The configuration options for AWS SQS, including the list of queues.
     * @returns An array of providers, each representing a configured SQS queue.
     */
    useFactory: (options: AwsSqsModuleOptions): Provider[] =>
      options.queues.map((queue: QueueConfig) => ({
        provide: `${AWS_SQS_QUEUE}_${queue.name.toUpperCase()}`,
        useValue: queue,
      })),
    inject: [AWS_SQS_MODULE_OPTIONS],
  },
];
