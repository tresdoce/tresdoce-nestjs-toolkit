import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';

import { AwsSqsService } from './services/aws-sqs.service';
import { AWS_SQS_MESSAGE_HANDLER } from './constants/aws-sqs.constant';
import { Message } from '@aws-sdk/client-sqs';

/**
 * Listener service that dynamically discovers and binds message handlers
 * for AWS SQS queues during module initialization.
 */
@Injectable()
export class AwsSqsListener implements OnModuleInit {
  private readonly logger: Logger = new Logger(AwsSqsListener.name);
  private isListening: boolean = true;

  constructor(
    private readonly sqsService: AwsSqsService,
    private readonly reflector: Reflector,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  /**
   * Called when the module is initialized.
   * Discovers and registers all message handlers defined in the application.
   */
  async onModuleInit(): Promise<void> {
    const handlers = this.getMessageHandlers();
    handlers.forEach(({ queueName, handler }) => this.listenToQueue(queueName, handler));
  }

  /**
   * Stops the listener when the module is destroyed.
   */
  onModuleDestroy(): void {
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
  private getMessageHandlers(): { queueName: string; handler: Function }[] {
    const handlers: { queueName: string; handler: Function }[] = [];

    this.modulesContainer.forEach((moduleRef): void => {
      Array.from(moduleRef.controllers.values()).forEach((instance): void => {
        const prototype = Object.getPrototypeOf(instance.instance);
        const methodNames: string[] = Object.getOwnPropertyNames(prototype);

        methodNames.forEach((methodName: string): void => {
          const queueName: string = this.reflector.get<string>(
            AWS_SQS_MESSAGE_HANDLER,
            prototype[methodName],
          );

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
  private async listenToQueue(queueName: string, handler: Function): Promise<void> {
    this.logger.log(`Listening to queue: ${queueName}`);

    try {
      const isTest: boolean = process.env.NODE_ENV === 'test';
      let iterationCount: number = 0;
      /* istanbul ignore next */
      const maxIterations: number = isTest ? 2 : Infinity;

      do {
        const messages: Message[] = await this.sqsService.receiveMessage(queueName);

        if (messages.length > 0) {
          for (const message of messages) {
            await handler(message);
            /* istanbul ignore next */
            if (message.ReceiptHandle) {
              await this.sqsService.deleteMessage(queueName, message.ReceiptHandle);
              this.logger.log(`Message deleted: ${message.MessageId}`);
            }
          }
        } else {
          this.logger.log(`No messages received from ${queueName}.`);
        }

        if (isTest && ++iterationCount >= maxIterations) break;
        await this.delay(1000);
      } while (this.isListening);
    } catch (error) {
      this.logger.error(`Error on queue ${queueName}: ${error.message}`);
    }
  }

  /**
   * Helper method to create a delay between iterations.
   * @param ms Number of milliseconds to delay.
   * @returns A promise that resolves after the specified delay.
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
