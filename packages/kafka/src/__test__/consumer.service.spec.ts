import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import { Kafka, logLevel } from 'kafkajs';
import { randomUUID } from 'node:crypto';
import { join } from 'path';

import { KafkaModule } from '../kafka/kafka.module.js';
import { kafkaTestBaseConfig, schemaRegistryUrl } from './utils/kafka-config.js';
import { ConsumerService } from '../kafka/services/consumer.service.js';
import { ProducerService } from '../kafka/services/producer.service.js';
import { KafkaMessage, KafkaResponse } from '../kafka/interfaces/kafka.interface.js';
import { SUBSCRIBER_MAP, SUBSCRIBER_OBJECT_MAP } from '../kafka/decorators/kafka.decorator.js';
import { KafkaAvroResponseDeserializer } from '../kafka/deserializer/kafka-avro-response.deserializer.js';
import { KafkaAvroRequestSerializer } from '../kafka/serializer/kafka-avro-request.serializer.js';

const TOPIC_NAME = 'testTopic';
const TOPIC_NAME_A = 'testTopicA';
const schemaRegistryHost = schemaRegistryUrl;
const kafkaDebug = process.env.KAFKA_TEST_DEBUG === 'true';

vi.setConfig({ testTimeout: 45000 });

const debugLog = (message: string) => {
  if (kafkaDebug) {
    console.log(`[kafka-test] ${message}`);
  }
};

const waitFor = async (
  predicate: () => boolean,
  timeoutMs = 3000,
  intervalMs = 100,
): Promise<void> => {
  const startedAt = Date.now();

  while (!predicate()) {
    if (Date.now() - startedAt >= timeoutMs) {
      throw new Error(`Timed out waiting after ${timeoutMs}ms`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
};

const toComparableValue = (value: unknown): unknown =>
  value && typeof value === 'object' ? (JSON.parse(JSON.stringify(value)) as unknown) : value;

const getObjectId = (value: unknown): number | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return (value as { id?: number }).id;
};

const ensureTopics = async (topics: string[]) => {
  const kafka = new Kafka({
    logLevel: logLevel.NOTHING,
    ...kafkaTestBaseConfig.client,
  });
  const admin = kafka.admin();

  try {
    await admin.connect();
    await admin.createTopics({
      waitForLeaders: true,
      topics: topics.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });
  } finally {
    await admin.disconnect();
  }
};

const singleMessage: KafkaMessage = {
  key: { id: randomUUID() },
  value: {
    id: 1,
    firstName: 'Foo',
    lastName: 'Bar',
    __table: 'test-table',
    __deleted: null,
  },
  headers: { 'my-head': 'my-value' },
};

const multipleMessage: KafkaMessage[] = [
  {
    key: { id: randomUUID() },
    value: {
      id: 2,
      firstName: 'Foo2',
      lastName: 'Bar2',
      __table: 'test-table',
      __deleted: null,
    },
  },
  {
    key: { id: randomUUID() },
    value: {
      id: 3,
      firstName: 'Foo3',
      lastName: 'Bar3',
      __table: 'test-table',
      __deleted: null,
    },
  },
];

describe('ConsumerService', () => {
  let app: INestApplication;
  let consumerService: ConsumerService;
  let producerService: ProducerService;
  let receivedMessage: KafkaResponse = null;

  const messageHandler = (msgResponse: KafkaResponse) => {
    receivedMessage = msgResponse;
  };

  const registerSubscriber = (topic: string) => {
    SUBSCRIBER_MAP.set(topic, messageHandler);
    SUBSCRIBER_OBJECT_MAP.set(topic, {});
  };

  describe('With Schema Registry', () => {
    beforeAll(async () => {
      debugLog('With Schema Registry: ensureTopics');
      await ensureTopics([TOPIC_NAME]);
    });

    beforeEach(async () => {
      debugLog('With Schema Registry: beforeEach start');
      receivedMessage = null;
      SUBSCRIBER_MAP.clear();
      SUBSCRIBER_OBJECT_MAP.clear();
      registerSubscriber(TOPIC_NAME);

      debugLog('With Schema Registry: creating testing module');
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          KafkaModule,
          await ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                kafka: {
                  ...kafkaTestBaseConfig,
                  consumer: {
                    ...kafkaTestBaseConfig.consumer,
                    groupId: `nestjs-test-consumer-${randomUUID()}`,
                  },
                  subscribe: {
                    fromBeginning: true,
                  },
                  deserializer: new KafkaAvroResponseDeserializer({
                    host: schemaRegistryHost,
                  }),
                  serializer: new KafkaAvroRequestSerializer({
                    config: {
                      host: schemaRegistryHost,
                    },
                    schemas: [
                      {
                        topic: TOPIC_NAME,
                        key: join(import.meta.dirname, 'utils/key-schema.avsc'),
                        value: join(import.meta.dirname, 'utils/value-schema.avsc'),
                      },
                    ],
                    options: {},
                  }),
                  seek: {
                    [TOPIC_NAME]: new Date('2024-01-01'),
                  },
                },
              }),
            ],
          }),
        ],
      }).compile();
      debugLog('With Schema Registry: testing module compiled');

      app = module.createNestApplication();
      debugLog('With Schema Registry: application created');
      await app.init();
      debugLog('With Schema Registry: application initialized');
      consumerService = module.get<ConsumerService>(ConsumerService);
      producerService = module.get<ProducerService>(ProducerService);
      debugLog('With Schema Registry: services resolved');
    });

    afterEach(async () => {
      debugLog('With Schema Registry: afterEach start');
      SUBSCRIBER_MAP.clear();
      SUBSCRIBER_OBJECT_MAP.clear();
      if (consumerService) {
        await consumerService.disconnect();
      }
      await app.close();
      debugLog('With Schema Registry: application closed');
    });

    it('should be defined', () => {
      expect(consumerService).toBeDefined();
    });

    it('should connect and disconnect the consumers on module init and destroy', async () => {
      expect(consumerService.isConsumerConnected()).toBe(true);
      await consumerService.disconnect();
      expect(consumerService.isConsumerConnected()).toBe(false);
      await consumerService.connect();
      expect(consumerService.isConsumerConnected()).toBe(true);
    });

    it('should subscribe to a topic and handle single message', async () => {
      receivedMessage = null;
      await producerService.sendMessages(TOPIC_NAME, singleMessage);
      await waitFor(
        () =>
          getObjectId(toComparableValue(receivedMessage?.value)) ===
          getObjectId(singleMessage.value),
        5000,
      );
      expect(toComparableValue(receivedMessage.value)).toEqual(singleMessage.value);
    });

    it('should subscribe to a topic and handle multiple messages', async () => {
      receivedMessage = null;
      await producerService.sendMessages(TOPIC_NAME, multipleMessage);
      await waitFor(
        () =>
          getObjectId(toComparableValue(receivedMessage?.value)) ===
          getObjectId(multipleMessage[1].value),
        5000,
      );
      expect(toComparableValue(receivedMessage.value)).toEqual(multipleMessage[1].value);
    });
  });

  describe('Without Schema Registry', () => {
    beforeAll(async () => {
      debugLog('Without Schema Registry: ensureTopics');
      await ensureTopics([TOPIC_NAME_A]);
    });

    beforeEach(async () => {
      debugLog('Without Schema Registry: beforeEach start');
      receivedMessage = null;
      SUBSCRIBER_MAP.clear();
      SUBSCRIBER_OBJECT_MAP.clear();
      registerSubscriber(TOPIC_NAME_A);

      debugLog('Without Schema Registry: creating testing module');
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          KafkaModule,
          await ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                kafka: {
                  ...kafkaTestBaseConfig,
                  consumer: {
                    ...kafkaTestBaseConfig.consumer,
                    groupId: `nestjs-test-consumer-${randomUUID()}`,
                  },
                  subscribe: {
                    fromBeginning: false,
                  },
                  seek: {
                    [TOPIC_NAME_A]: 'earliest',
                  },
                },
              }),
            ],
          }),
        ],
      }).compile();
      debugLog('Without Schema Registry: testing module compiled');

      app = module.createNestApplication();
      debugLog('Without Schema Registry: application created');
      await app.init();
      debugLog('Without Schema Registry: application initialized');
      consumerService = module.get<ConsumerService>(ConsumerService);
      producerService = module.get<ProducerService>(ProducerService);
      debugLog('Without Schema Registry: services resolved');
    });

    afterEach(async () => {
      debugLog('Without Schema Registry: afterEach start');
      SUBSCRIBER_MAP.clear();
      SUBSCRIBER_OBJECT_MAP.clear();
      if (consumerService) {
        await consumerService.disconnect();
      }
      await app.close();
      debugLog('Without Schema Registry: application closed');
    });

    it('should be defined', () => {
      expect(consumerService).toBeDefined();
    });

    it('should connect and disconnect the consumers on module init and destroy', async () => {
      expect(consumerService.isConsumerConnected()).toBe(true);
      await consumerService.disconnect();
      expect(consumerService.isConsumerConnected()).toBe(false);
      await consumerService.connect();
      expect(consumerService.isConsumerConnected()).toBe(true);
    });

    it('should subscribe to a topic and handle single message', async () => {
      receivedMessage = null;
      await producerService.sendMessages(TOPIC_NAME_A, singleMessage);
      await waitFor(() => JSON.stringify(receivedMessage?.value) === singleMessage.value, 5000);
      expect(JSON.stringify(receivedMessage.value)).toEqual(singleMessage.value);
    });

    it('should subscribe to a topic and handle multiple messages', async () => {
      const multiMsg = [
        ...multipleMessage,
        {
          key: { id: randomUUID() },
          value: 'Hello world',
        },
      ];
      receivedMessage = null;
      await producerService.sendMessages(TOPIC_NAME_A, multiMsg);
      await waitFor(() => receivedMessage?.value === multiMsg[2].value, 5000);
      expect(receivedMessage.value).toEqual(multiMsg[2].value);
    });
  });
});
