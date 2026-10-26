import camunda from 'camunda-external-task-client-js';

export * from './camunda/camunda.module.js';
export * from './camunda/providers/camunda.provider.js';
export * from './camunda/decorators/camunda.decorator.js';
export * from './camunda/interfaces/camunda.interface.js';

// camunda-external-task-client-js is CommonJS and Node only detects `Client` as a named
// export, so the runtime values are read from its default export.
export const { Client, Variables, BasicAuthInterceptor, logger } = camunda;
export type Client = InstanceType<typeof Client>;
export type Variables = InstanceType<typeof Variables>;
export type BasicAuthInterceptor = InstanceType<typeof BasicAuthInterceptor>;
export type {
  ClientConfig,
  BasicAuthInterceptorConfig,
  HandlerArgs,
  Task,
  TaskService,
  TopicSubscription,
  TypedValue,
  HandleFailureOptions,
  SubscribeOptions,
  Logger,
} from 'camunda-external-task-client-js';
