export * from './aws-sqs/aws-sqs.module.js';
export * from './aws-sqs/services/aws-sqs.service.js';
export * from './aws-sqs/interfaces/aws-sqs.interface.js';
export * from './aws-sqs/decorators/aws-sqs-message-handler.decorator.js';
export * from './aws-sqs/constants/aws-sqs.constant.js';
export { getAwsSqsQueueToken } from './aws-sqs/providers/aws-sqs.provider.js';
export type { Message } from '@aws-sdk/client-sqs';
