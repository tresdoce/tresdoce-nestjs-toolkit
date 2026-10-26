import { Inject, Injectable, Logger } from '@nestjs/common';
import { Server, type CustomTransportStrategy, type MessageHandler } from '@nestjs/microservices';
import camunda, { type ClientConfig, type SubscribeOptions } from 'camunda-external-task-client-js';
import { lastValueFrom } from 'rxjs';

import {
  CAMUNDA_SUBSCRIBE_OPTIONS,
  CONFIG_MODULE_OPTIONS,
} from '../constants/camunda.constants.js';

interface CamundaSubscription {
  topic: string;
  options: SubscribeOptions | null;
}

@Injectable()
export class CamundaTaskConnector extends Server implements CustomTransportStrategy {
  private readonly client: InstanceType<typeof camunda.Client>;

  constructor(@Inject(CONFIG_MODULE_OPTIONS) private readonly clientConfig: ClientConfig) {
    super();
    // Polling starts in `listen()`, once the handlers are subscribed. With `autoPoll: true`
    // (the library default) the client would poll as soon as it is instantiated, and `start()`
    // would then launch a second polling loop.
    this.client = new camunda.Client({ ...this.clientConfig, autoPoll: false });
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
    this.getHandlers().forEach((messageHandler: MessageHandler, key: string) => {
      const { topic, options } = this.resolveSubscription(key, messageHandler);
      this.client.subscribe(topic, options, ({ task, taskService }) =>
        this.handleTask(messageHandler, task, taskService),
      );
    });

    this.client.start();
    Logger.log('External Task Client started', CamundaTaskConnector.name);
  }

  /**
   * Runs the Nest handler and waits for its result. Nest wraps handlers with interceptors in a
   * lazy Observable and turns thrown errors into an error Observable, so it must be subscribed
   * for the handler to run and for failures to reach the client (`handler:error` event).
   * Unknown errors are already logged by Nest's `RpcExceptionsHandler`.
   */
  protected async handleTask(
    messageHandler: MessageHandler,
    task: unknown,
    taskService: unknown,
  ): Promise<void> {
    await lastValueFrom(this.transformToObservable(messageHandler(task, taskService)), {
      defaultValue: undefined,
    });
  }

  private resolveSubscription(key: string, messageHandler: MessageHandler): CamundaSubscription {
    const extras = messageHandler.extras ?? {};
    if (CAMUNDA_SUBSCRIBE_OPTIONS in extras) {
      return { topic: key, options: extras[CAMUNDA_SUBSCRIBE_OPTIONS] };
    }
    // Backward compatibility with `@MessagePattern({ topic, options })` patterns.
    if (key.startsWith('{')) {
      const { topic, options } = JSON.parse(key);
      if (typeof topic === 'string') return { topic, options: options ?? null };
    }
    return { topic: key, options: null };
  }

  public on<EventKey extends string = string, EventCallback extends Function = Function>(
    event: EventKey,
    _callback: EventCallback,
  ): any {
    Logger.log(`Registered event: ${event}`, CamundaTaskConnector.name);
  }

  public unwrap<T>(): T {
    return this.client as unknown as T;
  }
}
