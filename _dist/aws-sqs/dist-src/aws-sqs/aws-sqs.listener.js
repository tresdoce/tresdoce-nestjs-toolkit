var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AwsSqsListener_1;
import { Injectable, Logger } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { AwsSqsService } from './services/aws-sqs.service';
import { AWS_SQS_MESSAGE_HANDLER } from './constants/aws-sqs.constant';
/**
 * Listener service that dynamically discovers and binds message handlers
 * for AWS SQS queues during module initialization.
 */
let AwsSqsListener = AwsSqsListener_1 = class AwsSqsListener {
    constructor(sqsService, reflector, modulesContainer) {
        this.sqsService = sqsService;
        this.reflector = reflector;
        this.modulesContainer = modulesContainer;
        this.logger = new Logger(AwsSqsListener_1.name);
        this.isListening = true;
    }
    /**
     * Called when the module is initialized.
     * Discovers and registers all message handlers defined in the application.
     */
    async onModuleInit() {
        const handlers = this.getMessageHandlers();
        handlers.forEach(({ queueName, handler }) => this.listenToQueue(queueName, handler));
    }
    /**
     * Stops the listener when the module is destroyed.
     */
    onModuleDestroy() {
        this.isListening = false;
        this.logger.log('SQS Listener stopped.');
    }
    /**
     * Retrieves all message handlers by scanning the modules for decorated methods.
     * @returns An array of objects containing the queue name and its associated handler function.
     * @example
     * const handlers = listener.getMessageHandlers();
     * handlers.forEach(({ queueName, handler }) =>
     *   listener.listenToQueue(queueName, handler)
     * );
     */
    getMessageHandlers() {
        const handlers = [];
        this.modulesContainer.forEach((moduleRef) => {
            Array.from(moduleRef.controllers.values()).forEach((instance) => {
                const prototype = Object.getPrototypeOf(instance.instance);
                const methodNames = Object.getOwnPropertyNames(prototype);
                methodNames.forEach((methodName) => {
                    const queueName = this.reflector.get(AWS_SQS_MESSAGE_HANDLER, prototype[methodName]);
                    if (queueName) {
                        this.logger.log(`Handler found for queue: ${queueName}`);
                        handlers.push({
                            queueName,
                            handler: prototype[methodName].bind(instance.instance),
                        });
                    }
                });
            });
        });
        return handlers;
    }
    /**
     * Starts listening to a specified SQS queue and continuously processes messages.
     * If a message is received, the associated handler is executed,
     * and the message is deleted from the queue upon successful processing.
     * @param queueName The logical name of the queue to listen to.
     * @param handler The handler function to process incoming messages.
     */
    async listenToQueue(queueName, handler) {
        this.logger.log(`Listening to queue: ${queueName}`);
        try {
            const isTest = process.env.NODE_ENV === 'test';
            let iterationCount = 0;
            /* istanbul ignore next */
            const maxIterations = isTest ? 2 : Infinity;
            do {
                const messages = await this.sqsService.receiveMessage(queueName);
                if (messages.length > 0) {
                    for (const message of messages) {
                        await handler(message);
                        if (message.ReceiptHandle) {
                            await this.sqsService.deleteMessage(queueName, message.ReceiptHandle);
                            this.logger.log(`Message deleted: ${message.MessageId}`);
                        }
                    }
                }
                else {
                    this.logger.log(`No messages received from ${queueName}.`);
                }
                if (isTest && ++iterationCount >= maxIterations)
                    break;
                await this.delay(1000);
            } while (this.isListening);
        }
        catch (error) {
            this.logger.error(`Error on queue ${queueName}: ${error.message}`);
        }
    }
    /**
     * Helper method to create a delay between iterations.
     * @param ms Number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
AwsSqsListener = AwsSqsListener_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [AwsSqsService,
        Reflector,
        ModulesContainer])
], AwsSqsListener);
export { AwsSqsListener };
