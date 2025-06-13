var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AwsSqsService_1;
import { Injectable, Inject, Logger } from '@nestjs/common';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, } from '@aws-sdk/client-sqs';
import { AWS_SQS_MODULE_OPTIONS } from '../constants/aws-sqs.constant';
/**
 * Service to interact with AWS SQS, providing methods to send, receive, and delete messages.
 */
let AwsSqsService = AwsSqsService_1 = class AwsSqsService {
    /**
     * Constructor to initialize AWS SQS service with provided options.
     * @param options Configuration options for AWS SQS.
     */
    constructor(options) {
        this.options = options;
        this.logger = new Logger(AwsSqsService_1.name);
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
    async sendMessage(options) {
        const queue = this.getQueue(options.queueName);
        const body = this.serializeMessageBody(options.messageBody);
        const commandInput = {
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
    async receiveMessage(queueName, maxNumberOfMessages = 1, waitTimeSeconds = 20) {
        const queue = this.getQueue(queueName);
        const commandInput = {
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
    async deleteMessage(queueName, receiptHandle) {
        const queue = this.getQueue(queueName);
        const commandInput = {
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
    getQueue(queueName) {
        const queue = this.options.queues.find((q) => q.name === queueName);
        if (!queue)
            throw new Error(`Queue "${queueName}" not found`);
        return queue;
    }
    /**
     * Helper method to serialize the message body to a string.
     * Validates the body type and serializes it if necessary.
     * @param body Message body, which can be a string, object, or null.
     * @returns The message body as a string.
     * @throws Error if the body is not a valid string or object.
     */
    serializeMessageBody(body) {
        if (typeof body === 'string')
            return body;
        if (typeof body === 'object' && body !== null)
            return JSON.stringify(body);
        throw new Error('Message body must be a string or a non-null object');
    }
};
AwsSqsService = AwsSqsService_1 = __decorate([
    Injectable(),
    __param(0, Inject(AWS_SQS_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], AwsSqsService);
export { AwsSqsService };
