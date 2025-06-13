var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AwsSqsModule_1;
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS } from './constants/aws-sqs.constant';
import { AwsSqsService } from './services/aws-sqs.service';
import { AwsSqsListener } from './aws-sqs.listener';
import { createQueueProviders } from './providers/aws-sqs.provider';
/**
 * AWS SQS Module for NestJS, providing services and listeners to interact with AWS SQS.
 * This module supports both synchronous and asynchronous registration and configuration.
 */
let AwsSqsModule = AwsSqsModule_1 = class AwsSqsModule {
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
            providers: [
                { provide: AWS_SQS_MODULE_OPTIONS, useValue: options },
                AwsSqsService,
                AwsSqsListener,
                ...createQueueProviders(),
            ],
            exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
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
            providers: [
                ...this.createAsyncProviders(options),
                ...(options.extraProviders || []),
                AwsSqsService,
                AwsSqsListener,
                ...createQueueProviders(),
            ],
            exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
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
            providers: [
                { provide: AWS_SQS_MODULE_OPTIONS, useValue: options },
                AwsSqsService,
                AwsSqsListener,
                ...createQueueProviders(),
            ],
            exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
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
            providers: [
                ...this.createAsyncProviders(options),
                ...(options.extraProviders || []),
                AwsSqsService,
                AwsSqsListener,
                ...createQueueProviders(),
            ],
            exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
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
        if (options.useClass)
            providers.push({
                provide: options.useClass,
                useClass: options.useClass,
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
                inject: options.inject || [],
            };
        }
        let inject;
        if (options.useExisting)
            inject = [options.useExisting];
        else if (options.useClass)
            inject = [options.useClass];
        return {
            provide: AWS_SQS_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => optionsFactory.createOptions(),
            inject,
        };
    }
};
AwsSqsModule = AwsSqsModule_1 = __decorate([
    Global(),
    Module({
        imports: [ConfigModule],
        providers: [
            {
                provide: AWS_SQS_MODULE_OPTIONS,
                useFactory: async (configService) => configService.get('config.sqs'),
                inject: [ConfigService],
            },
            AwsSqsService,
            AwsSqsListener,
            ...createQueueProviders(),
        ],
        exports: [AwsSqsService, AWS_SQS_MODULE_OPTIONS, AWS_SQS_QUEUE_PROVIDERS],
    })
], AwsSqsModule);
export { AwsSqsModule };
