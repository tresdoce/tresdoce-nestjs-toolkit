import { Deserializer } from '@nestjs/microservices';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import type { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api/index.js';
import type { SchemaRegistryAPIClientOptions } from '@kafkajs/confluent-schema-registry/dist/@types.js';
import type { IHeaders as KafkaJsHeaders, KafkaMessage as KafkaJsMessage } from 'kafkajs';

import type { KafkaResponse } from '../interfaces/kafka.interface.js';
import { KafkaResponseDeserializer } from './kafka-response.deserializer.js';

/**
 * Intermediate shape used while decoding: `key`/`value` start as raw Avro-encoded
 * buffers and are progressively replaced by their decoded (dynamic, schema-shaped)
 * counterparts, so they can't be typed any more strictly than `unknown` here.
 */
interface DecodeResponse {
  key: unknown;
  value: unknown;
  timestamp: string;
  offset: string | number;
  headers?: KafkaJsHeaders;
}

export class KafkaAvroResponseDeserializer implements Deserializer<
  KafkaJsMessage,
  Promise<KafkaResponse>
> {
  protected registry: SchemaRegistry;
  protected fallback: KafkaResponseDeserializer;

  constructor(config: SchemaRegistryAPIClientArgs, options?: SchemaRegistryAPIClientOptions) {
    this.registry = new SchemaRegistry(config, options);
    this.fallback = new KafkaResponseDeserializer();
  }

  async deserialize(message: KafkaJsMessage): Promise<KafkaResponse> {
    const { value, key, timestamp, offset, headers } = message;
    const decodeResponse: DecodeResponse = {
      value,
      key,
      timestamp,
      offset,
      headers,
    };

    try {
      /* istanbul ignore next */
      decodeResponse.key = key && key.length > 0 ? await this.registry.decode(key) : null;
      /* istanbul ignore next */
      decodeResponse.value = value ? await this.registry.decode(value) : value;
    } catch {
      /* istanbul ignore next */
      const msg = this.fallback.deserialize(message);
      /* istanbul ignore next */
      Object.assign(decodeResponse, msg);
    }

    return decodeResponse as unknown as KafkaResponse;
  }
}
