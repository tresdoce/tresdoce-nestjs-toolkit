import { delay, parseJSON } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { EventContext, Receiver, ReceiverOptions } from 'rhea-promise';

import { ConsumerMetadata } from '../domain/consumer-metadata.domain';
import { MessageControl } from '../domain/message-control.domain';
import { CreateReceiverOptions } from '../interfaces/amqp.interfaces';
import { ErrorMessage } from '../utils/error-message.utils';
import { AMQPService } from './amqp.service';

@Injectable()
export class ConsumerService {
  // private readonly logger = getLogger();
  private readonly receivers: Map<string, Receiver>;
  private readonly creating: Map<string, boolean>;
  private readonly parallelMessageCount = 1;
  private readonly concurrency = 1;

  constructor(private readonly amqpService: AMQPService) {
    this.receivers = new Map<string, Receiver>();
    this.creating = new Map<string, boolean>();
  }

  public async consume<T>(
    consumer: ConsumerMetadata,
    callback: (object: T, control: MessageControl) => Promise<void>,
  ): Promise<void> {
    const { source, options, consumerToken } = consumer;
    const credits = options?.parallelMessageProcessing || this.parallelMessageCount;
    const concurrency = options?.concurrency || this.concurrency;
    const messageHandler = async (context: EventContext): Promise<void> => {
      const control: MessageControl = new MessageControl(context);
      const { message_id, body } = context.message;
      // this.logger.silly(`Incoming '${source}' id: ${message_id}`);
      //console.log(`Incoming '${source}' id: ${message_id}`);

      const objectLike = body instanceof Buffer ? body.toString() : body;
      const object = parseJSON<T>(objectLike);
      try {
        const startTime = new Date();
        await callback(object, control);
        const durationInMs = new Date().getTime() - startTime.getTime();
        // this.logger.silly(`Completed '${source}' id: ${message_id} in ${durationInMs / 1000} seconds`);
        //console.log(`Completed '${source}' id: ${message_id} in ${durationInMs / 1000} seconds`);
        if (!control.isHandled) {
          control.accept();
        }
      } catch (error) {
        const errorMessage = ErrorMessage.fromError(error);
        // this.logger.error(`An error occurred '${source}' id: ${message_id}`, error);
        //console.log(`An error occurred '${source}' id: ${message_id}`, error);
        control.reject(errorMessage);
      }
    };
    const concurrent = new Array(concurrency).fill(null).map((_, i) => i + 1);
    for await (const index of concurrent) {
      const consumerName = `${consumerToken}-${index}`;
      await this.getReceiver(consumer, consumerName, credits, messageHandler);
    }
  }

  private async getReceiver(
    consumer: ConsumerMetadata,
    consumerName: string,
    credits: number,
    messageHandler: (context: EventContext) => Promise<void>,
    retry = 0,
  ): Promise<Receiver> {
    const { source, connectionToken } = consumer;
    if (this.creating.has(consumerName)) {
      await delay(1000);
    }
    if (this.receivers.has(consumerName)) {
      return this.receivers.get(consumerName);
    }
    if (this.creating.has(consumerName)) {
      if (retry > 10) {
        throw new Error('Create receiver error: Maximum retry attempts');
      }
      return this.getReceiver(consumer, consumerName, credits, messageHandler, retry++);
    }
    this.creating.set(consumerName, true);
    const onError = (context: EventContext): void => {
      const errorMessage = ErrorMessage.fromReceiver(context);
      // this.logger.error('Receiver error', { name: consumerName, source, errorMessage });
      //console.log('Receiver error', { name: consumerName, source, errorMessage });
    };
    const receiverOptions: ReceiverOptions = {
      source,
      name: consumerName,
      onError: onError.bind(this),
      onMessage: messageHandler.bind(this),
      autoaccept: false,
      credit_window: 0,
    };
    const createOptions: CreateReceiverOptions = {
      credits,
      connectionToken,
      receiverOptions,
    };
    const receiver = await this.amqpService.createReceiver(createOptions);
    this.receivers.set(consumerName, receiver);
    this.creating.delete(consumerName);
    return receiver;
  }
}
