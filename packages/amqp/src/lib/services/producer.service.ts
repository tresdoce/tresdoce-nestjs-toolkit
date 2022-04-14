import { delay, getRandomInt, jsonStringify } from '@dollarsign/utils';
import { Injectable } from '@nestjs/common';
import { AwaitableSender, CreateAwaitableSenderOptions, Message } from 'rhea-promise';

import { CreateSenderOptions, DeliveryStatus, SendOptions } from '../interfaces/amqp.interfaces';
import { getID, getProducerToken } from '../utils/amqp.utils';
import { ErrorMessage } from '../utils/error-message.utils';
import { AMQPService } from './amqp.service';

@Injectable()
export class ProducerService {
  // private readonly logger = getLogger();
  private readonly senders: Map<string, AwaitableSender>;
  private readonly creating: Map<string, boolean>;

  constructor(private readonly amqpService: AMQPService) {
    this.senders = new Map<string, AwaitableSender>();
    this.creating = new Map<string, boolean>();
  }

  /**
   * @param target - name of the queue
   * @param body - message body
   * @param options - send options
   * @returns state of send
   */
  public async send<T>(target: string, body: T, options?: SendOptions): Promise<DeliveryStatus> {
    const { connectionName, ...messageOptions } = options || {};
    try {
      const sender = await this.getSender(target, connectionName);
      const msg: Message = {
        durable: true,
        message_id: getID(),
        body: jsonStringify(body),
        ...messageOptions,
      };
      while (!sender.sendable()) {
        // this.logger.warn('Sender insufficient credit, Retry...');
        //console.log('Sender insufficient credit, Retry...');
        const delayTime = getRandomInt(10, 20) * 1000;
        await delay(delayTime);
      }
      const delivery = await sender.send(msg);
      const { settled } = delivery;
      if (!settled) {
        // this.logger.warn(`Send to ${target} failed message id: ${msg.message_id}`, body);
        //console.log(`Send to ${target} failed message id: ${msg.message_id}`, body);
      }
      return {
        delivery,
        status: settled,
      };
    } catch (error) {
      const errorMessage = ErrorMessage.fromError(error);
      const connectionClosed = errorMessage.includes(`Cannot read property 'address' of undefined`);
      const msg = connectionClosed ? 'connection closed' : errorMessage;
      // this.logger.error(`Send message error: ${target} ${msg}`, body);
      //console.log(`Send message error: ${target} ${msg}`, body);
      return {
        error,
        status: false,
      };
    }
  }

  /**
   * @param target - name of the queue
   * @param connectionName - connection name
   * @returns sender
   */
  private async getSender(
    target: string,
    connectionName: string,
    retry = 0,
  ): Promise<AwaitableSender> {
    const producerToken = getProducerToken(target, connectionName);
    if (this.creating.has(producerToken)) {
      await delay(2000);
    }
    if (this.senders.has(producerToken)) {
      return this.senders.get(producerToken);
    }
    if (this.creating.has(producerToken)) {
      if (retry > 10) {
        throw new Error('Create sender error: Maximum retry attempts');
      }
      return this.getSender(target, connectionName, retry++);
    }
    this.creating.set(producerToken, true);
    const senderOptions: CreateAwaitableSenderOptions = {
      name: producerToken,
      target: {
        address: target,
        capabilities: ['queue'],
      },
    };
    const createOptions: CreateSenderOptions = {
      connectionName,
      senderOptions,
    };
    const sender = await this.amqpService.createSender(createOptions);
    this.senders.set(producerToken, sender);
    this.creating.delete(producerToken);
    return sender;
  }
}
