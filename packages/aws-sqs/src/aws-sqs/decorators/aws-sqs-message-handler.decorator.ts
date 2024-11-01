import { SetMetadata } from '@nestjs/common';
import { AWS_SQS_MESSAGE_HANDLER } from '../constants/aws-sqs.constant';

/**
 * A decorator to mark a method as an AWS SQS message handler for a specific queue.
 * The decorated method will be invoked whenever a message is received from the specified queue.
 *
 * @param queueName The logical name of the queue to handle messages from.
 * @returns A method decorator that registers the queue name as metadata.
 *
 * @example
 * import { AwsSqsMessageHandler } from './decorators/aws-sqs-message-handler.decorator';
 *
 * class OrdersController {
 *   @AwsSqsMessageHandler('orders')
 *   async handleOrderMessage(message: any): Promise<void> {
 *     console.log(`Processing order message: ${message.Body}`);
 *   }
 * }
 */
export const AwsSqsMessageHandler = (queueName: string): MethodDecorator =>
  SetMetadata(AWS_SQS_MESSAGE_HANDLER, queueName);
