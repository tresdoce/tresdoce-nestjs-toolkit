import { DynamicModule } from '@nestjs/common';
import { AwsSqsModuleAsyncOptions, AwsSqsModuleOptions } from './interfaces/aws-sqs.interface';
/**
 * AWS SQS Module for NestJS, providing services and listeners to interact with AWS SQS.
 * This module supports both synchronous and asynchronous registration and configuration.
 */
export declare class AwsSqsModule {
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
    static register(options: AwsSqsModuleOptions): DynamicModule;
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
    static registerAsync(options: AwsSqsModuleAsyncOptions): DynamicModule;
    /**
     * Registers the module globally with synchronous configuration.
     * @param options Configuration options for AWS SQS.
     * @returns A globally configured DynamicModule.
     */
    static forRoot(options: AwsSqsModuleOptions): DynamicModule;
    /**
     * Registers the module globally with asynchronous configuration.
     * @param options Asynchronous configuration options for AWS SQS.
     * @returns A globally configured DynamicModule.
     */
    static forRootAsync(options: AwsSqsModuleAsyncOptions): DynamicModule;
    /**
     * Creates providers for asynchronous registration.
     * @param options Asynchronous configuration options.
     * @returns An array of providers.
     */
    private static createAsyncProviders;
    /**
     * Creates the provider for asynchronous options.
     * @param options Asynchronous configuration options.
     * @returns A provider that resolves the module options.
     */
    private static createAsyncOptionsProvider;
}
