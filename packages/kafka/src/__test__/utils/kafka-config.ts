import { inject } from 'vitest';
import type { KafkaModuleOptions } from '../../kafka/interfaces/kafka.interface.js';

declare module 'vitest' {
  export interface ProvidedContext {
    /** `host:port` of the Kafka broker started by vitest.globalSetup.ts. */
    kafkaBroker: string;
    /** Base URL of the Schema Registry started by vitest.globalSetup.ts. */
    schemaRegistryUrl: string;
  }
}

/** Real addresses of the containers started in vitest.globalSetup.ts. */
export const kafkaBroker = inject('kafkaBroker');
export const schemaRegistryUrl = inject('schemaRegistryUrl');

export const kafkaTestBaseConfig: KafkaModuleOptions = {
  client: {
    clientId: 'nestjs-test',
    brokers: [kafkaBroker],
    retry: {
      initialRetryTime: 1000,
      retries: 10,
    },
    connectionTimeout: 3000,
    requestTimeout: 25000,
  },
  consumer: {
    groupId: 'nestjs-test-consumer',
  },
};
