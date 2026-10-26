import {
  KafkaConfig,
  ConsumerConfig,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  ProducerConfig,
} from 'kafkajs';
import { Deserializer, Serializer } from '@nestjs/microservices';

/**
 * Represents a message to be sent or received through Kafka.
 */
export type KafkaMessage = {
  /** Optional message key. Arbitrary objects are accepted since
   * KafkaRequestSerializer#encode() serializes non-Buffer/string values
   * before the message is actually sent. */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  key?: Buffer | string | any | null;

  /** Message payload. */
  value: string | object | Buffer | null;

  /** Optional target partition. */
  partition?: number;

  /** Optional transport headers. */
  headers?: Record<string, string>;

  /** Optional message timestamp in epoch milliseconds. */
  timestamp?: string;
};

/**
 * Represents the headers received from Kafka after deserialization.
 */
export interface IHeaders {
  [key: string]: any;
}

/**
 * Normalized Kafka request payload sent to KafkaJS producers.
 *
 * @template T Payload type.
 */
export interface KafkaRequest<T = any> {
  key: Buffer | string | null;
  value: T;
  topic: string;
  headers: Record<string, any>;
}

/**
 * Normalized Kafka response payload delivered to subscribers.
 *
 * @template T Payload type.
 */
export interface KafkaResponse<T = any> {
  key: string;
  value: T;
  headers?: IHeaders;
  timestamp: string;
  offset: number;
}

/**
 * Wrapper used by serializers to send one or more messages to a topic.
 */
export interface KafkaMessageSend {
  topic: string;
  messages: KafkaMessage | KafkaMessage[];
}

/**
 * Options for configuring the Kafka module.
 */
export interface KafkaModuleOptions {
  /** KafkaJS client configuration. */
  client?: KafkaConfig;

  /** KafkaJS consumer configuration. */
  consumer?: ConsumerConfig;

  /** KafkaJS consumer run options, excluding message handlers managed by the module. */
  run?: Omit<ConsumerRunConfig, 'eachBatch' | 'eachMessage'>;

  /** Consumer subscription options, excluding `topics` handled by decorators. */
  subscribe?: Omit<ConsumerSubscribeTopics, 'topics'>;

  /** KafkaJS producer configuration. */
  producer?: ProducerConfig;

  /** Optional custom deserializer for incoming Kafka messages. */
  deserializer?: Deserializer;

  /** Optional custom serializer for outgoing Kafka messages. */
  serializer?: Serializer;

  /** Optional seek configuration per topic. */
  seek?: Record<string, number | 'earliest' | Date>;
}
