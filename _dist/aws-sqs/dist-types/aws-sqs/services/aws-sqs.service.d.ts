import { Message } from '@aws-sdk/client-sqs';
import { AwsSqsModuleOptions, SendMessageOptions } from '../interfaces/aws-sqs.interface';
/**
 * Service to interact with AWS SQS, providing methods to send, receive, and delete messages.
 */
export declare class AwsSqsService {
    private readonly options;
    private readonly sqsClient;
    private readonly logger;
    /**
     * Constructor to initialize AWS SQS service with provided options.
     * @param options Configuration options for AWS SQS.
     */
    constructor(options: AwsSqsModuleOptions);
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
    sendMessage(options: SendMessageOptions): Promise<void>;
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
    receiveMessage(queueName: string, maxNumberOfMessages?: number, waitTimeSeconds?: number): Promise<Message[]>;
    /**
     * Deletes a message from the specified SQS queue using its ReceiptHandle.
     * @param queueName Logical name of the queue.
     * @param receiptHandle Receipt handle of the message to delete.
     * @throws Error if the specified queue is not found.
     * @example
     * await this.sqsService.deleteMessage('orders', 'AQEBwJnK...');
     */
    deleteMessage(queueName: string, receiptHandle: string): Promise<void>;
    /**
     * Helper method to get the queue configuration by its logical name.
     * @param queueName Logical name of the queue.
     * @returns Queue configuration object.
     * @throws Error if the queue is not found.
     */
    private getQueue;
    /**
     * Helper method to serialize the message body to a string.
     * Validates the body type and serializes it if necessary.
     * @param body Message body, which can be a string, object, or null.
     * @returns The message body as a string.
     * @throws Error if the body is not a valid string or object.
     */
    private serializeMessageBody;
}
