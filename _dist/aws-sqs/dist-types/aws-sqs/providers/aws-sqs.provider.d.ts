import { Provider } from '@nestjs/common';
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
export declare const createQueueProviders: () => Provider[];
