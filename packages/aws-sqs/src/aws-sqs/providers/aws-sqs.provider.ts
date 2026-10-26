import type { Provider } from '@nestjs/common';

import type { AwsSqsModuleOptions, QueueConfig } from '../interfaces/aws-sqs.interface.js';
import {
  AWS_SQS_MODULE_OPTIONS,
  AWS_SQS_QUEUE,
  AWS_SQS_QUEUE_PROVIDERS,
} from '../constants/aws-sqs.constant.js';

/**
 * Creates the `AWS_SQS_QUEUE_PROVIDERS` provider. It resolves (from `AWS_SQS_MODULE_OPTIONS`)
 * to an array of `{ provide: 'AWS_SQS_QUEUE_<NAME>', useValue: QueueConfig }` descriptors.
 *
 * Note: the resolved array is a value, the descriptors are NOT registered as providers.
 * Individual `AWS_SQS_QUEUE_<NAME>` tokens are only injectable when the module is configured
 * synchronously (`register` / `forRoot`), see `getAwsSqsQueueToken`.
 *
 * @returns An array with the `AWS_SQS_QUEUE_PROVIDERS` provider.
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
      createQueueValueProviders(options?.queues),
    inject: [AWS_SQS_MODULE_OPTIONS],
  },
];

/**
 * Returns the injection token of a configured queue (`AWS_SQS_QUEUE_<NAME>`).
 * @param queueName Logical name of the queue.
 * @example
 * constructor(@Inject(getAwsSqsQueueToken('orders')) private readonly ordersQueue: QueueConfig) {}
 */
export const getAwsSqsQueueToken = (queueName: string): string =>
  `${AWS_SQS_QUEUE}_${queueName.toUpperCase()}`;

/**
 * Maps each queue to a value provider registered under `getAwsSqsQueueToken(queue.name)`.
 * @param queues Configured queues.
 */
export const createQueueValueProviders = (queues: QueueConfig[] = []): Provider[] =>
  queues.map((queue: QueueConfig) => ({
    provide: getAwsSqsQueueToken(queue.name),
    useValue: queue,
  }));
