import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server, CustomTransportStrategy, MessageHandler } from '@nestjs/microservices';
import { Client, ClientConfig } from 'camunda-external-task-client-js';

import { CONFIG_MODULE_OPTIONS } from '../constants/camunda.constants';

@Injectable()
export class CamundaTaskConnector extends Server implements CustomTransportStrategy {
  private client: Client;

  constructor(@Inject(CONFIG_MODULE_OPTIONS) private readonly clientConfig: ClientConfig) {
    super();
    this.client = new Client(this.clientConfig);
  }

  public async listen(callback: () => void) {
    this.init();
    callback();
  }

  /* istanbul ignore next */
  public close() {
    this.client.stop();
    Logger.log('External Task Client stopped', 'CamundaTaskConnector');
  }

  protected init(): void {
    this.client.start();

    Logger.log('External Task Client started', 'CamundaTaskConnector');

    const handlers = this.getHandlers();
    /* istanbul ignore next */
    handlers.forEach((messageHandler: MessageHandler, key: string) => {
      const { topic, options } = JSON.parse(key);

      this.client.subscribe(topic, options, async ({ task, taskService }) => {
        await messageHandler(task, taskService);
      });
    });
  }
}
