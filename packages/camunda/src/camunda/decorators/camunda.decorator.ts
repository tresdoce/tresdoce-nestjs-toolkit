import { MessagePattern } from '@nestjs/microservices';
import { SubscribeOptions } from 'camunda-external-task-client-js';

export const Subscription = (topic: string, options?: SubscribeOptions): MethodDecorator => {
  return (...args) => {
    const messagePattern = MessagePattern({ topic, options: options || null });
    messagePattern(...args);
  };
};
