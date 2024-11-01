import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  SendMessageCommandInput,
  ReceiveMessageCommandInput,
  DeleteMessageCommandInput,
  Message,
} from '@aws-sdk/client-sqs';

import { AWS_SQS_MODULE_OPTIONS } from '../constants/aws-sqs.constant';
import {
  AwsSqsModuleOptions,
  QueueConfig,
  SendMessageOptions,
} from '../interfaces/aws-sqs.interface';

/**
 * Service to interact with AWS SQS, providing methods to send, receive, and delete messages.
 */
@Injectable()
export class AwsSqsService {
  private readonly sqsClient: SQSClient;
  private readonly logger: Logger = new Logger(AwsSqsService.name);

  /**
   * Constructor to initialize AWS SQS service with provided options.
   * @param options Configuration options for AWS SQS.
   */
  constructor(@Inject(AWS_SQS_MODULE_OPTIONS) private readonly options: AwsSqsModuleOptions) {
    this.sqsClient = new SQSClient(options);
  }

  /**
   * Sends a message to the specified SQS queue.
   * If the message body is an object, it will be serialized to a string.
   * @param options Message options to send.
   * @throws Error if the specified queue is not found.
   * @example
   * await this.sqsService.sendMessage({
   *   queueName: 'orders',
   *   messageBody: { orderId: 123, product: 'Laptop' },
   *   delaySeconds: 5,
   *   messageAttributes: {
   *     Priority: { DataType: 'String', StringValue: 'High' },
   *   },
   * });
   */
  async sendMessage(options: SendMessageOptions): Promise<void> {
    const queue: QueueConfig = this.getQueue(options.queueName);
    const body: string = this.serializeMessageBody(options.messageBody);

    const commandInput: SendMessageCommandInput = {
      QueueUrl: queue.url,
      MessageBody: body,
      DelaySeconds: options.delaySeconds,
      MessageAttributes: options.messageAttributes,
      MessageGroupId: options.groupId,
      MessageDeduplicationId: options.deduplicationId,
    };

    await this.sqsClient.send(new SendMessageCommand(commandInput));
    this.logger.log(`Message sent to queue "${queue.name}": ${body}`);
  }

  /**
   * Receives messages from the specified SQS queue.
   * @param queueName Logical name of the queue to receive messages from.
   * @param maxNumberOfMessages The maximum number of messages to receive (default is 1).
   * @param waitTimeSeconds The duration (in seconds) for which to wait for a message (default is 20).
   * @returns An array of messages or an empty array if no messages are found.
   * @throws Error if the specified queue is not found.
   * @example
   * const messages = await this.sqsService.receiveMessage('orders', 5, 10);
   * if (messages.length > 0) {
   *   messages.forEach(msg => console.log('Received message:', msg.Body));
   * }
   */
  async receiveMessage(
    queueName: string,
    maxNumberOfMessages: number = 1,
    waitTimeSeconds: number = 20,
  ): Promise<Message[]> {
    const queue: QueueConfig = this.getQueue(queueName);

    const commandInput: ReceiveMessageCommandInput = {
      QueueUrl: queue.url,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds,
    };

    const response = await this.sqsClient.send(new ReceiveMessageCommand(commandInput));

    if (response.Messages?.length) {
      this.logger.log(`Received ${response.Messages.length} message(s) from queue "${queueName}".`);
      return response.Messages;
    }

    this.logger.log(`No messages available in queue "${queueName}".`);
    return [];
  }

  /**
   * Deletes a message from the specified SQS queue using its ReceiptHandle.
   * @param queueName Logical name of the queue.
   * @param receiptHandle Receipt handle of the message to delete.
   * @throws Error if the specified queue is not found.
   * @example
   * await this.sqsService.deleteMessage('orders', 'AQEBwJnK...');
   */
  async deleteMessage(queueName: string, receiptHandle: string): Promise<void> {
    const queue: QueueConfig = this.getQueue(queueName);

    const commandInput: DeleteMessageCommandInput = {
      QueueUrl: queue.url,
      ReceiptHandle: receiptHandle,
    };

    await this.sqsClient.send(new DeleteMessageCommand(commandInput));
    this.logger.log(`Message deleted from queue "${queueName}".`);
  }

  /**
   * Helper method to get the queue configuration by its logical name.
   * @param queueName Logical name of the queue.
   * @returns Queue configuration object.
   * @throws Error if the queue is not found.
   */
  private getQueue(queueName: string): QueueConfig {
    const queue: QueueConfig = this.options.queues.find(
      (q: QueueConfig): boolean => q.name === queueName,
    );
    if (!queue) throw new Error(`Queue "${queueName}" not found`);
    return queue;
  }

  /**
   * Helper method to serialize the message body to a string.
   * Validates the body type and serializes it if necessary.
   * @param body Message body, which can be a string, object, or null.
   * @returns The message body as a string.
   * @throws Error if the body is not a valid string or object.
   */
  private serializeMessageBody(body: unknown): string {
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null) return JSON.stringify(body);
    throw new Error('Message body must be a string or a non-null object');
  }
}
