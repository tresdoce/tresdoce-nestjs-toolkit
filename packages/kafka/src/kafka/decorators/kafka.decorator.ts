import type { Type } from '@nestjs/common';

/** Handler registered for a topic by `@SubscribeTo`. Argument/return shapes vary per consumer method. */
export type SubscriberHandler = (...args: any[]) => any;

export const SUBSCRIBER_MAP = new Map<string, SubscriberHandler>();
/** Instance used as `this` when a topic handler runs. Filled by `ConsumerService` on init. */
export const SUBSCRIBER_OBJECT_MAP = new Map<string, object>();
/** Class that declared each topic handler, used to resolve its instance from the DI container. */
export const SUBSCRIBER_CLASS_MAP = new Map<string, Type<unknown>>();
export const SCHEMAS = new Map<string, unknown>();

export const SubscribeTo = (topic: string) => {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    // `target` is the decorated class prototype; it isn't statically known to have an index
    // signature, so the property lookup is narrowed via an explicit cast rather than `any`.
    const originalMethod = (target as Record<string, SubscriberHandler>)[propertyKey];
    SUBSCRIBER_MAP.set(topic, originalMethod);
    SUBSCRIBER_CLASS_MAP.set(topic, target.constructor as Type<unknown>);
    return descriptor;
  };
};
