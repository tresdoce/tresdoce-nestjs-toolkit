import { MessagePattern } from '@nestjs/microservices';
import type { SubscribeOptions } from 'camunda-external-task-client-js';

import { CAMUNDA_SUBSCRIBE_OPTIONS } from '../constants/camunda.constants.js';

/**
 * Registers the decorated method as the handler of a Camunda external task topic.
 * The topic is the message pattern and the options travel untouched in the pattern extras
 * (Nest normalizes object patterns into a string, which turned arrays such as `variables` into objects).
 */
export const Subscription = (topic: string, options?: SubscribeOptions): MethodDecorator =>
  MessagePattern(topic, { [CAMUNDA_SUBSCRIBE_OPTIONS]: options ?? null });
