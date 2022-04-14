import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { hostname } from 'os';
import {
  AwaitableSender,
  Connection,
  ConnectionEvents,
  Container,
  EventContext,
  Receiver,
  ReceiverEvents,
  SenderEvents,
} from 'rhea-promise';

import {
  AMQPModuleOptions,
  CreateReceiverOptions,
  CreateSenderOptions,
} from '../interfaces/amqp.interfaces';
import { getConnectionToken, parseURL } from '../utils/amqp.utils';
import { ErrorMessage } from '../utils/error-message.utils';

@Injectable()
export class AMQPService {
  //   private static readonly logger = getLogger();

  constructor(private readonly moduleRef: ModuleRef) {}

  /**
   * @param options - module options
   * @returns connection
   */
  public static async createConnection(options: AMQPModuleOptions): Promise<Connection> {
    const connectionToken = getConnectionToken(options);

    // this.logger.silly(`Connection creating: ${connectionToken}`);
    //console.log(`Connection creating: ${connectionToken}`);
    if (!options) {
      throw new Error(`Invalid connection options: ${connectionToken}`);
    }
    const { protocol, username, password, url, port, connectionOptions } = options;
    //const { connectionUri, connectionOptions } = options;
    const connectionUri = `${protocol}://${
      username ? `${username}:${password}@` : ''
    }${url}:${port}`;
    const container = new Container({
      id: `${connectionToken}:${hostname()}:${new Date().getTime()}`.toLowerCase(),
    });

    const connection = container.createConnection({
      ...(!!connectionUri ? parseURL(connectionUri) : {}),
      ...connectionOptions,
    });
    connection.on(ConnectionEvents.connectionOpen, (context: EventContext) => {
      //   this.logger.silly(`Connection opened: ${connectionToken}`, context.connection.id);
      //console.log(`Connection opened: ${connectionToken}`, context.connection.id);
    });
    connection.on(ConnectionEvents.connectionError, (context: EventContext) => {
      const error = [`Connection error: ${connectionToken}`, ErrorMessage.fromContext(context)];
      //   this.logger.error(...error.filter(e => e));
      //console.log(...error.filter((e) => e));
    });
    connection.on(ConnectionEvents.disconnected, (context: EventContext) => {
      const error = [
        `Connection closed by peer: ${connectionToken}`,
        ErrorMessage.fromContext(context),
      ];
      //   this.logger.warn(...error.filter(e => e));
      // //console.log(...error.filter((e) => e));
    });
    connection.on(ConnectionEvents.connectionClose, (context: EventContext) => {
      const error = `Connection closed: ${connectionToken}`;
      if (ErrorMessage.fromContext(context)) {
        // this.logger.error(error);
        //console.log(error);
      } else {
        // this.logger.warn(error);
        //console.log(error);
      }
    });
    try {
      await connection.open();
    } catch (err) {
      const errorMessage = ErrorMessage.fromError(err);
      //   this.logger.error(`Connection open failed: ${connectionToken}`, errorMessage);
      //console.log(`Connection open failed: ${connectionToken}`, errorMessage);
    }
    return connection;
  }

  /**
   * @param options - create sender options
   * @returns sender
   */
  public async createSender(options: CreateSenderOptions): Promise<AwaitableSender> {
    const { connectionName, senderOptions } = options;
    const connectionToken = getConnectionToken(connectionName);
    const connection = this.moduleRef.get<Connection>(connectionToken, { strict: false });
    const sender = await connection.createAwaitableSender(senderOptions);
    sender.on(SenderEvents.senderOpen, (context: EventContext) => {
      //   AMQPService.logger.silly(`Sender opened: ${context?.sender?.name}`);
      //console.log(`Sender opened: ${context?.sender?.name}`);
    });
    sender.on(SenderEvents.senderClose, (context: EventContext) => {
      //   AMQPService.logger.warn(`Sender closed: ${context?.sender?.name}`);
      //console.log(`Sender closed: ${context?.sender?.name}`);
    });
    sender.on(SenderEvents.senderError, (context: EventContext) => {
      const errorMessage = ErrorMessage.fromSender(context);
      //   AMQPService.logger.error(`Sender error: ${context?.sender?.name}`, {
      //     error: errorMessage,
      //   });
      //console.log(`Sender error: ${context?.sender?.name}`, { error: errorMessage });
    });
    sender.on(SenderEvents.senderDraining, (context: EventContext) => {
      const { name } = context?.sender;
      //   AMQPService.logger.silly(`Sender requested to drain its credits by remote peer: ${name}`);
      //console.log(`Sender requested to drain its credits by remote peer: ${name}`);
    });
    return sender;
  }

  public async createReceiver(options: CreateReceiverOptions): Promise<Receiver> {
    const { connectionToken, credits, receiverOptions } = options;
    const connection = this.moduleRef.get<Connection>(connectionToken, { strict: false });
    const receiver = await connection.createReceiver(receiverOptions);
    receiver.addCredit(credits);
    receiver.on(ReceiverEvents.receiverOpen, (context: EventContext) => {
      const { name } = context?.receiver;
      //   AMQPService.logger.silly(`Receiver opened: ${name}`);
      //console.log(`Receiver opened: ${name}`);
      const currentCredits = context.receiver.credit;
      if (currentCredits < credits) {
        // AMQPService.logger.silly(`Receiver adding credits: ${name}`);
        //console.log(`Receiver adding credits: ${name}`);
        context.receiver.addCredit(credits - currentCredits);
      }
    });
    receiver.on(ReceiverEvents.receiverClose, (context: EventContext) => {
      const { name } = context?.receiver;
      //   AMQPService.logger.silly(`Receiver closed: ${name}`);
      //console.log(`Receiver closed: ${name}`);
    });
    receiver.on(ReceiverEvents.receiverDrained, (context: EventContext) => {
      const { name } = context?.receiver;
      //   AMQPService.logger.silly(`Remote peer for receiver drained: ${name}`);
      //console.log(`Remote peer for receiver drained: ${name}`);
    });
    receiver.on(ReceiverEvents.receiverFlow, (context: EventContext) => {
      const { name } = context?.receiver;
      //   AMQPService.logger.silly(`Flow event received for receiver: ${name}`);
      //console.log(`Flow event received for receiver: ${name}`);
    });
    receiver.on(ReceiverEvents.settled, (context: EventContext) => {
      const { name } = context?.receiver;
      //   AMQPService.logger.silly(`Message has been settled by remote: ${name}`);
      //console.log(`Message has been settled by remote: ${name}`);
    });
    // AMQPService.logger.silly('Receiver created', { credits: receiver?.credit, name: receiver?.name });
    //console.log('Receiver created', { credits: receiver?.credit, name: receiver?.name });
    return receiver;
  }
}
