import { Deserializer } from '@nestjs/microservices';
import type { IHeaders as KafkaJsHeaders, KafkaMessage as KafkaJsMessage } from 'kafkajs';

import type { KafkaResponse } from '../interfaces/kafka.interface.js';

export class KafkaResponseDeserializer implements Deserializer<KafkaJsMessage, KafkaResponse> {
  deserialize(message: KafkaJsMessage): KafkaResponse {
    const { key, value, timestamp, offset, headers } = message;
    let id: Buffer | string | null = key;
    let response: unknown = value;
    /* istanbul ignore next */
    if (Buffer.isBuffer(key)) {
      id = Buffer.from(key).toString();
    }
    /* istanbul ignore next */
    if (Buffer.isBuffer(value)) {
      const valueString = Buffer.from(value).toString();
      try {
        response = JSON.parse(valueString);
      } catch {
        response = valueString;
      }
    }

    const normalizedHeaders: KafkaJsHeaders = { ...headers };
    Object.keys(normalizedHeaders).forEach((headerKey) => {
      const headerValue = normalizedHeaders[headerKey];
      /* istanbul ignore next */
      if (Buffer.isBuffer(headerValue)) {
        normalizedHeaders[headerKey] = Buffer.from(headerValue).toString();
      }
    });

    return {
      key: id as string,
      value: response,
      timestamp,
      offset: offset as unknown as number,
      headers: normalizedHeaders,
    };
  }
}
