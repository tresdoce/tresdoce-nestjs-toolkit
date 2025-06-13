import { OnModuleInit } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { AwsSqsService } from './services/aws-sqs.service';
/**
 * Listener service that dynamically discovers and binds message handlers
 * for AWS SQS queues during module initialization.
 */
export declare class AwsSqsListener implements OnModuleInit {
    private readonly sqsService;
    private readonly reflector;
    private readonly modulesContainer;
    private readonly logger;
    private isListening;
    constructor(sqsService: AwsSqsService, reflector: Reflector, modulesContainer: ModulesContainer);
    /**
     * Called when the module is initialized.
     * Discovers and registers all message handlers defined in the application.
     */
    onModuleInit(): Promise<void>;
    /**
     * Stops the listener when the module is destroyed.
     */
    onModuleDestroy(): void;
    /**
     * Retrieves all message handlers by scanning the modules for decorated methods.
     * @returns An array of objects containing the queue name and its associated handler function.
     * @example
     * const handlers = listener.getMessageHandlers();
     * handlers.forEach(({ queueName, handler }) =>
     *   listener.listenToQueue(queueName, handler)
     * );
     */
    private getMessageHandlers;
    /**
     * Starts listening to a specified SQS queue and continuously processes messages.
     * If a message is received, the associated handler is executed,
     * and the message is deleted from the queue upon successful processing.
     * @param queueName The logical name of the queue to listen to.
     * @param handler The handler function to process incoming messages.
     */
    private listenToQueue;
    /**
     * Helper method to create a delay between iterations.
     * @param ms Number of milliseconds to delay.
     * @returns A promise that resolves after the specified delay.
     */
    private delay;
}
