import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import { Kafka, logLevel } from 'kafkajs';
import { randomUUID } from 'node:crypto';

import { KafkaModule } from '../kafka/kafka.module.js';
import { kafkaTestBaseConfig } from './utils/kafka-config.js';
import { KafkaMessage } from '../kafka/interfaces/kafka.interface.js';
import { ProducerService } from '../kafka/services/producer.service.js';

vi.setConfig({ testTimeout: 45000 });

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

describe('ProducerService', () => {
  let app: INestApplication;
  let service: ProducerService;

  beforeAll(async () => {
    await ensureTopics(['testTopicA', 'testTopicB', 'testTopicC']);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        KafkaModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              kafka: kafkaTestBaseConfig,
            }),
          ],
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get<ProducerService>(ProducerService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessages', () => {
    it('should send a single message to a specific topic', async () => {
      const topic = 'testTopicA';
      const message: KafkaMessage = {
        key: randomUUID(),
        value: { id: 1, name: 'testName', lastName: 'testLastName' },
        headers: { 'my-header': 'my-value' },
        timestamp: '1625097600000',
      };
      await expect(service.sendMessages(topic, message)).resolves.toBeUndefined();
    });

    it('should send a single message to a specific topic as array', async () => {
      const topic = 'testTopicA';
      const message: KafkaMessage = {
        key: randomUUID(),
        value: ['a', 'b', 'c'],
        headers: { 'my-header': 'my-value' },
        timestamp: '1625097600000',
      };
      await expect(service.sendMessages(topic, message)).resolves.toBeUndefined();
    });

    it('should use toString method for non-plain object and non-array values', async () => {
      class CustomClass {
        toString() {
          return 'custom string representation';
        }
      }

      const topic = 'testTopicA';
      const customObject = new CustomClass();
      const message: KafkaMessage = {
        key: randomUUID(),
        value: customObject,
        headers: { 'my-header': 'my-value' },
      };

      await expect(service.sendMessages(topic, message)).resolves.toBeUndefined();
    });

    it('should send a single message to a specific topic when value is null', async () => {
      const topic = 'testTopicA';
      const message: KafkaMessage = {
        key: randomUUID(),
        value: null,
        headers: { 'my-header': 'my-value' },
      };
      await expect(service.sendMessages(topic, message)).resolves.toBeUndefined();
    });

    it('should wrap non-Kafka message in a value property', async () => {
      const topic = 'testTopicA';
      const nonKafkaMessage: KafkaMessage | null = null;
      await expect(service.sendMessages(topic, nonKafkaMessage)).resolves.toBeUndefined();
    });

    it('should handle undefined value by setting it to null', async () => {
      const topic = 'testTopicA';
      const messageWithUndefinedValue: KafkaMessage = {
        key: randomUUID(),
        value: undefined,
        headers: { 'my-header': 'my-value' },
      };
      await expect(service.sendMessages(topic, messageWithUndefinedValue)).resolves.toBeUndefined();
    });

    it('should send multiple messages to a specific topic', async () => {
      const topic = 'testTopicA';
      const messages: KafkaMessage[] = [
        { value: 'Only message' },
        { key: randomUUID(), value: 'Message with key' },
        {
          key: randomUUID(),
          value: 'Message with key and headers',
          headers: { 'my-header': 'my-value' },
        },
        { value: 'Message with timestamp but without key', timestamp: '1625097600000' },
        {
          key: randomUUID(),
          value: 'Message with all properties',
          headers: { 'my-header': 'my-value' },
          timestamp: '1625097600000',
        },
        {
          key: randomUUID(),
          value: { id: 1, name: 'testName', lastName: 'testLastName' },
          headers: { 'my-header': 'my-value' },
          timestamp: '1625097600000',
        },
      ];
      await expect(service.sendMessages(topic, messages)).resolves.toBeUndefined();
    });
  });

  describe('sendBatchMessages', () => {
    it('should send a batch of messages to a single topic', async () => {
      const topicMessages = [
        {
          topic: 'testTopicA',
          messages: [
            { key: randomUUID(), value: 'Message 1' },
            { key: randomUUID(), value: 'Message 2' },
          ],
        },
      ];
      await expect(service.sendBatchMessages(topicMessages)).resolves.toBeUndefined();
    });

    it('should send batches of messages to multiple topics', async () => {
      const topicMessages = [
        {
          topic: 'testTopicB',
          messages: [
            { key: randomUUID(), value: 'Message 1 for topic B' },
            { key: randomUUID(), value: 'Message 2 for topic B' },
          ],
        },
        {
          topic: 'testTopicC',
          messages: [
            { key: randomUUID(), value: 'Message 1 for topic C' },
            { key: randomUUID(), value: 'Message 2 for topic C' },
          ],
        },
      ];
      await expect(service.sendBatchMessages(topicMessages)).resolves.toBeUndefined();
    });

    it('should send a batch of messages with various properties to a single topic', async () => {
      const topicMessages = [
        {
          topic: 'testTopicA',
          messages: [
            { value: 'Message without key' },
            { key: randomUUID(), value: 'Message with key' },
            {
              key: randomUUID(),
              value: 'Message with key and headers',
              headers: { 'my-header': 'my-value' },
            },
            { value: 'Message with timestamp but without key', timestamp: '1625097600000' },
            {
              key: randomUUID(),
              value: 'Message with all properties',
              headers: { 'my-header': 'my-value' },
              timestamp: '1625097600000',
            },
            {
              key: randomUUID(),
              value: { id: 1, name: 'testName', lastName: 'testLastName' },
              headers: { 'my-header': 'my-value' },
              timestamp: '1625097600000',
            },
          ],
        },
      ];
      await expect(service.sendBatchMessages(topicMessages)).resolves.toBeUndefined();
    });
  });
});
