import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server, CustomTransportStrategy, MessageHandler } from '@nestjs/microservices';
import { Client, ClientConfig } from 'camunda-external-task-client-js';

import { CONFIG_MODULE_OPTIONS } from '../constants/camunda.constants';

@Injectable()
export class CamundaTaskConnector extends Server implements CustomTransportStrategy {
  private readonly client: Client;

  constructor(@Inject(CONFIG_MODULE_OPTIONS) private readonly clientConfig: ClientConfig) {
    super();
    this.client = new Client(this.clientConfig);
  }

  public async listen(callback: () => void) {
    this.init();
    callback();
  }

  public close() {
    this.client.stop();
    Logger.log('External Task Client stopped', CamundaTaskConnector.name);
  }

  protected init(): void {
    this.client.start();
    Logger.log('External Task Client started', CamundaTaskConnector.name);

    const handlers = this.getHandlers();
    handlers.forEach((messageHandler: MessageHandler, key: string) => {
      const { topic, options } = JSON.parse(key);
      /* istanbul ignore next */
      this.client.subscribe(topic, options, async ({ task, taskService }): Promise<void> => {
        await messageHandler(task, taskService);
      });
    });
  }

  public on<EventKey extends string = string, EventCallback extends Function = Function>(
    event: EventKey,
    callback: EventCallback,
  ): any {
    Logger.log(`Registered event: ${event}`, CamundaTaskConnector.name);
  }

  public unwrap<T>(): T {
    return this.client as unknown as T;
  }
}
