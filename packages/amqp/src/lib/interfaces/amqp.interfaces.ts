import {
  ConnectionOptions,
  CreateAwaitableSenderOptions,
  Delivery,
  Message,
  ReceiverOptions as CreateAwaitableReceiverOptions,
} from 'rhea-promise';
import { Typings } from '@tresdoce-nestjs-toolkit/core';

export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type AMQPTransport = PropType<ConnectionOptions, 'transport'>;

export interface SendOptions extends Omit<Message, 'body'> {
  connectionName?: string;
}

export interface DeliveryStatus {
  delivery?: Delivery;
  error?: Error;
  status: boolean;
}
export interface CreateReceiverOptions {
  connectionToken?: string;
  credits: number;
  receiverOptions: CreateAwaitableReceiverOptions;
}
export interface CreateSenderOptions {
  connectionName?: string;
  senderOptions: CreateAwaitableSenderOptions;
}

export interface ConsumerOptions {
  concurrency?: number;
  connectionName?: string;
  parallelMessageProcessing?: number;
}

export interface ConnectionURL {
  host: string;
  password: string;
  port: number;
  transport: AMQPTransport;
  username: string;
}

export interface AMQPModuleOptions extends Typings.IArtemisConfiguration {
  connectionUri?: string;
}

export interface AMQPModuleOptionsFactory {
  createAMQPModuleOptions(): Promise<AMQPModuleOptions> | AMQPModuleOptions;
}

export interface AMQPModuleAsyncOptions {
  name: string;
}
