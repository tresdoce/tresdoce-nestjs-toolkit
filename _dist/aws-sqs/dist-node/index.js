'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var clientSqs = require('@aws-sdk/client-sqs');
var core = require('@nestjs/core');

const AWS_SQS_MODULE_OPTIONS = Symbol('AWS_SQS_MODULE_OPTIONS');
const AWS_SQS_QUEUE_PROVIDERS = Symbol('AWS_SQS_QUEUE_PROVIDERS');
const AWS_SQS_MESSAGE_HANDLER = Symbol('AWS_SQS_MESSAGE_HANDLER');
const AWS_SQS_QUEUE = 'AWS_SQS_QUEUE';

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
var AwsSqsService_1;
/**
 * Service to interact with AWS SQS, providing methods to send, receive, and delete messages.
 */
exports.AwsSqsService = AwsSqsService_1 = class AwsSqsService {
  /**
   * Constructor to initialize AWS SQS service with provided options.
   * @param options Configuration options for AWS SQS.
   */
  constructor(options) {
    this.options = options;
    this.logger = new common.Logger(AwsSqsService_1.name);
    this.sqsClient = new clientSqs.SQSClient(options);
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
      MessageDeduplicationId: options.deduplicationId
    };
    await this.sqsClient.send(new clientSqs.SendMessageCommand(commandInput));
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
    var _response$Messages;
    const queue = this.getQueue(queueName);
    const commandInput = {
      QueueUrl: queue.url,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds
    };
    const response = await this.sqsClient.send(new clientSqs.ReceiveMessageCommand(commandInput));
    if ((_response$Messages = response.Messages) !== null && _response$Messages !== void 0 && _response$Messages.length) {
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
      ReceiptHandle: receiptHandle
    };
    await this.sqsClient.send(new clientSqs.DeleteMessageCommand(commandInput));
    this.logger.log(`Message deleted from queue "${queueName}".`);
  }
  /**
   * Helper method to get the queue configuration by its logical name.
   * @param queueName Logical name of the queue.
   * @returns Queue configuration object.
   * @throws Error if the queue is not found.
   */
  getQueue(queueName) {
    const queue = this.options.queues.find(q => q.name === queueName);
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
  serializeMessageBody(body) {
    if (typeof body === 'string') return body;
    if (typeof body === 'object' && body !== null) return JSON.stringify(body);
    throw new Error('Message body must be a string or a non-null object');
  }
};
exports.AwsSqsService = AwsSqsService_1 = __decorate([common.Injectable(), __param(0, common.Inject(AWS_SQS_MODULE_OPTIONS)), __metadata("design:paramtypes", [Object])], exports.AwsSqsService);

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AwsSqsListener_1;
/**
 * Listener service that dynamically discovers and binds message handlers
 * for AWS SQS queues during module initialization.
 */
let AwsSqsListener = AwsSqsListener_1 = class AwsSqsListener {
  constructor(sqsService, reflector, modulesContainer) {
    this.sqsService = sqsService;
    this.reflector = reflector;
    this.modulesContainer = modulesContainer;
    this.logger = new common.Logger(AwsSqsListener_1.name);
    this.isListening = true;
  }
  /**
   * Called when the module is initialized.
   * Discovers and registers all message handlers defined in the application.
   */
  async onModuleInit() {
    const handlers = this.getMessageHandlers();
    handlers.forEach(({
      queueName,
      handler
    }) => this.listenToQueue(queueName, handler));
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
    this.modulesContainer.forEach(moduleRef => {
      Array.from(moduleRef.controllers.values()).forEach(instance => {
        const prototype = Object.getPrototypeOf(instance.instance);
        const methodNames = Object.getOwnPropertyNames(prototype);
        methodNames.forEach(methodName => {
          const queueName = this.reflector.get(AWS_SQS_MESSAGE_HANDLER, prototype[methodName]);
          if (queueName) {
            this.logger.log(`Handler found for queue: ${queueName}`);
            handlers.push({
              queueName,
              handler: prototype[methodName].bind(instance.instance)
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
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};
AwsSqsListener = AwsSqsListener_1 = __decorate$1([common.Injectable(), __metadata$1("design:paramtypes", [exports.AwsSqsService, core.Reflector, core.ModulesContainer])], AwsSqsListener);

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
const createQueueProviders = () => [{
  provide: AWS_SQS_QUEUE_PROVIDERS,
  /**
   * Factory function that transforms the list of SQS queues into an array of NestJS providers.
   * Each queue is provided with a unique identifier based on its name.
   *
   * @param options The configuration options for AWS SQS, including the list of queues.
   * @returns An array of providers, each representing a configured SQS queue.
   */
  useFactory: options => options.queues.map(queue => ({
    provide: `${AWS_SQS_QUEUE}_${queue.name.toUpperCase()}`,
    useValue: queue
  })),
  inject: [AWS_SQS_MODULE_OPTIONS]
}];

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AwsSqsModule_1;
/**
 * AWS SQS Module for NestJS, providing services and listeners to interact with AWS SQS.
 * This module supports both synchronous and asynchronous registration and configuration.
 */
exports.AwsSqsModule = AwsSqsModule_1 = class AwsSqsModule {
  /**
   * Registers the module with synchronous configuration.
   * @param options Configuration options for AWS SQS.
   * @returns A DynamicModule configured with the provided options.
   * @example
   * const sqsModule = AwsSqsModule.register({
   *   region: 'us-east-1',
   *   queues: [{ name: 'orders', url: 'https://sqs.us-east-1.amazonaws.com/123456/orders' }],
   * });
   */
  static register(options) {
    return {
      module: AwsSqsModule_1,
      providers: [{
        provide: AWS_SQS_MODULE_OPTIONS,
        useValue: options
      }, exports.AwsSqsService, AwsSqsListener, ...createQueueProviders()],
      exports: [exports.AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS]
    };
  }
  /**
   * Registers the module with asynchronous configuration.
   * @param options Asynchronous configuration options for AWS SQS.
   * @returns A DynamicModule configured asynchronously.
   * @example
   * const sqsModule = AwsSqsModule.registerAsync({
   *   imports: [ConfigModule],
   *   useFactory: async (configService: ConfigService) => ({
   *     region: configService.get('AWS_REGION'),
   *     queues: [{ name: 'orders', url: configService.get('ORDERS_QUEUE_URL') }],
   *   }),
   *   inject: [ConfigService],
   * });
   */
  static registerAsync(options) {
    return {
      module: AwsSqsModule_1,
      imports: [...(options.imports || [])],
      providers: [...this.createAsyncProviders(options), ...(options.extraProviders || []), exports.AwsSqsService, AwsSqsListener, ...createQueueProviders()],
      exports: [exports.AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS]
    };
  }
  /**
   * Registers the module globally with synchronous configuration.
   * @param options Configuration options for AWS SQS.
   * @returns A globally configured DynamicModule.
   */
  static forRoot(options) {
    return {
      global: true,
      module: AwsSqsModule_1,
      providers: [{
        provide: AWS_SQS_MODULE_OPTIONS,
        useValue: options
      }, exports.AwsSqsService, AwsSqsListener, ...createQueueProviders()],
      exports: [exports.AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS]
    };
  }
  /**
   * Registers the module globally with asynchronous configuration.
   * @param options Asynchronous configuration options for AWS SQS.
   * @returns A globally configured DynamicModule.
   */
  static forRootAsync(options) {
    return {
      global: true,
      module: AwsSqsModule_1,
      imports: options.imports || [],
      providers: [...this.createAsyncProviders(options), ...(options.extraProviders || []), exports.AwsSqsService, AwsSqsListener, ...createQueueProviders()],
      exports: [exports.AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS]
    };
  }
  /**
   * Creates providers for asynchronous registration.
   * @param options Asynchronous configuration options.
   * @returns An array of providers.
   */
  static createAsyncProviders(options) {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const providers = [this.createAsyncOptionsProvider(options)];
    if (options.useClass) providers.push({
      provide: options.useClass,
      useClass: options.useClass
    });
    return providers;
  }
  /**
   * Creates the provider for asynchronous options.
   * @param options Asynchronous configuration options.
   * @returns A provider that resolves the module options.
   */
  static createAsyncOptionsProvider(options) {
    if (options.useFactory) {
      return {
        provide: AWS_SQS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    let inject;
    if (options.useExisting) inject = [options.useExisting];else if (options.useClass) inject = [options.useClass];
    return {
      provide: AWS_SQS_MODULE_OPTIONS,
      useFactory: async optionsFactory => optionsFactory.createOptions(),
      inject
    };
  }
};
exports.AwsSqsModule = AwsSqsModule_1 = __decorate$2([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [{
    provide: AWS_SQS_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.sqs'),
    inject: [config.ConfigService]
  }, exports.AwsSqsService, AwsSqsListener, ...createQueueProviders()],
  exports: [exports.AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS]
})], exports.AwsSqsModule);

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
const AwsSqsMessageHandler = queueName => common.SetMetadata(AWS_SQS_MESSAGE_HANDLER, queueName);

exports.AwsSqsMessageHandler = AwsSqsMessageHandler;
//# sourceMappingURL=index.js.map
