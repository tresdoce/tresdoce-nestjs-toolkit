import type { MockInstance } from 'vitest';
const consumerMock = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  stop: vi.fn(),
  subscribe: vi.fn(),
  run: vi.fn(),
  seek: vi.fn(),
  on: vi.fn(),
};

const adminMock = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  fetchTopicOffsets: vi.fn(),
};

const createKafkaInstanceMock = () => ({
  consumer: vi.fn(() => consumerMock),
  admin: vi.fn(() => adminMock),
});

const kafkaFactoryMock = vi.fn(createKafkaInstanceMock);

vi.mock('kafkajs', () => ({
  Kafka: vi.fn().mockImplementation(function () {
    return kafkaFactoryMock();
  }),
  logLevel: { NOTHING: 0 },
}));

import type { SeekEntry } from 'kafkajs';
import { Logger } from '@nestjs/common';

import { ConsumerService } from '../kafka/services/consumer.service.js';
import {
  SUBSCRIBER_CLASS_MAP,
  SUBSCRIBER_MAP,
  SUBSCRIBER_OBJECT_MAP,
} from '../kafka/decorators/kafka.decorator.js';

const dockerTestHost = process.env.DOCKER_TEST_HOST || 'docker';

/** Exposes the private members of `ConsumerService` that these tests need to reach into. */
interface ConsumerServiceTestAccess {
  consumerRunning: boolean;
  consumerConnected: boolean;
  adminConnected: boolean;
  consumerRunPromise: Promise<void> | null;
  fetchTopicOffsetsWithRetry(topic: string): Promise<(SeekEntry & { high: string; low: string })[]>;
  waitForGroupJoin(): Promise<void>;
  seekWithRetry(topic: string, partition: number, offset: string): Promise<void>;
  resolveSeekOffset(
    seekPoint: number | 'earliest' | Date,
    topicOffset: { partition: number; offset: string; low: string },
  ): string;
}

const asInternal = (service: ConsumerService): ConsumerServiceTestAccess =>
  service as unknown as ConsumerServiceTestAccess;

/** Exposes the private static members of `ConsumerService` that these tests need to reach into. */
interface ConsumerServiceStaticTestAccess {
  TOPIC_OFFSETS_RETRY_ATTEMPTS: number;
  SEEK_RETRY_ATTEMPTS: number;
}

const ConsumerServiceStatic = ConsumerService as unknown as ConsumerServiceStaticTestAccess;

describe('ConsumerService retry logic', () => {
  let setTimeoutSpy: MockInstance;
  let clearTimeoutSpy: MockInstance;
  let consoleLogSpy: MockInstance;
  let loggerErrorSpy: MockInstance;
  let consumerEventListeners: Map<string, () => void>;

  const kafkaOptions = {
    client: {
      clientId: 'nestjs-test',
      brokers: [`${dockerTestHost}:9092`],
    },
    consumer: {
      groupId: 'nestjs-test-consumer',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    SUBSCRIBER_MAP.clear();
    SUBSCRIBER_OBJECT_MAP.clear();
    consumerEventListeners = new Map();

    consumerMock.connect.mockReset();
    consumerMock.disconnect.mockReset();
    consumerMock.stop.mockReset();
    consumerMock.subscribe.mockReset();
    consumerMock.run.mockReset();
    consumerMock.seek.mockReset();
    consumerMock.on.mockReset();

    adminMock.connect.mockReset();
    adminMock.disconnect.mockReset();
    adminMock.fetchTopicOffsets.mockReset();

    consumerMock.on.mockImplementation((eventName: string, listener: () => void) => {
      consumerEventListeners.set(eventName, listener);
      return () => consumerEventListeners.delete(eventName);
    });
    consumerMock.connect.mockResolvedValue(undefined);
    consumerMock.disconnect.mockResolvedValue(undefined);
    consumerMock.stop.mockResolvedValue(undefined);
    consumerMock.subscribe.mockResolvedValue(undefined);
    consumerMock.run.mockResolvedValue(undefined);
    consumerMock.seek.mockImplementation(() => undefined);
    adminMock.connect.mockResolvedValue(undefined);
    adminMock.disconnect.mockResolvedValue(undefined);
    adminMock.fetchTopicOffsets.mockResolvedValue([{ partition: 0, low: '0', high: '1' }]);

    setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    loggerErrorSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(vi.fn());
    delete process.env.KAFKA_TEST_DEBUG;
  });

  afterEach(() => {
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    consoleLogSpy.mockRestore();
    loggerErrorSpy.mockRestore();
    delete process.env.KAFKA_TEST_DEBUG;
  });

  it('should create the consumer with the configured groupId as-is', () => {
    new ConsumerService(kafkaOptions);

    const kafkaInstance = kafkaFactoryMock.mock.results.at(-1).value as ReturnType<
      typeof createKafkaInstanceMock
    >;
    expect(kafkaInstance.consumer).toHaveBeenCalledWith({ groupId: 'nestjs-test-consumer' });
  });

  it('should not create a consumer without groupId and fail clearly on connect', async () => {
    const service = new ConsumerService({ client: kafkaOptions.client });

    const kafkaInstance = kafkaFactoryMock.mock.results.at(-1).value as ReturnType<
      typeof createKafkaInstanceMock
    >;
    expect(kafkaInstance.consumer).not.toHaveBeenCalled();
    await expect(service.onModuleInit()).resolves.toBeUndefined();

    SUBSCRIBER_MAP.set('testTopic', vi.fn());
    await expect(service.onModuleInit()).rejects.toThrow(
      'Kafka consumer configuration is missing (config.kafka.consumer.groupId).',
    );
    await expect(service.disconnect()).resolves.toBeUndefined();
  });

  const useImmediateTimeouts = () => {
    const immediateSetTimeout: typeof setTimeout = ((
      callback: Parameters<typeof setTimeout>[0],
    ) => {
      if (typeof callback === 'function') {
        callback();
      }

      return 0 as never;
    }) as unknown as typeof setTimeout;

    setTimeoutSpy.mockImplementation(immediateSetTimeout);
    clearTimeoutSpy.mockImplementation(vi.fn());
  };

  it('should retry fetching topic offsets until the broker metadata is available', async () => {
    useImmediateTimeouts();
    const offsets = [{ partition: 0, low: '0', high: '1' }];
    adminMock.fetchTopicOffsets
      .mockRejectedValueOnce(new Error('This server does not host this topic-partition'))
      .mockResolvedValueOnce(offsets);

    const service = new ConsumerService(kafkaOptions);

    await expect(asInternal(service).fetchTopicOffsetsWithRetry('testTopic')).resolves.toEqual(
      offsets,
    );
    expect(adminMock.fetchTopicOffsets).toHaveBeenCalledTimes(2);
  });

  it('should throw the last error after exhausting all retry attempts', async () => {
    useImmediateTimeouts();
    adminMock.fetchTopicOffsets.mockRejectedValue(new Error('metadata unavailable'));

    const service = new ConsumerService(kafkaOptions);
    const expectedAttempts = ConsumerServiceStatic.TOPIC_OFFSETS_RETRY_ATTEMPTS;

    await expect(asInternal(service).fetchTopicOffsetsWithRetry('testTopic')).rejects.toThrow(
      'metadata unavailable',
    );
    expect(adminMock.fetchTopicOffsets).toHaveBeenCalledTimes(expectedAttempts);
  });

  it('should stop the runner before disconnecting when the consumer is running', async () => {
    const service = new ConsumerService(kafkaOptions);

    const internal = asInternal(service);
    internal.consumerRunning = true;
    internal.consumerConnected = true;
    internal.adminConnected = true;
    internal.consumerRunPromise = Promise.resolve();

    await service.disconnect();

    expect(consumerMock.stop).toHaveBeenCalledTimes(1);
    expect(consumerMock.disconnect).toHaveBeenCalledTimes(1);
    expect(adminMock.disconnect).toHaveBeenCalledTimes(1);
    expect(internal.consumerRunning).toBe(false);
    expect(internal.consumerRunPromise).toBeNull();
  });

  it('should ignore runner promise rejections while disconnecting', async () => {
    const service = new ConsumerService(kafkaOptions);

    const internal = asInternal(service);
    internal.consumerRunning = true;
    internal.consumerConnected = true;
    internal.adminConnected = true;
    internal.consumerRunPromise = Promise.reject(new Error('runner rejected on shutdown'));

    await expect(service.disconnect()).resolves.toBeUndefined();
    expect(consumerMock.stop).toHaveBeenCalledTimes(1);
    expect(consumerMock.disconnect).toHaveBeenCalledTimes(1);
    expect(adminMock.disconnect).toHaveBeenCalledTimes(1);
    expect(internal.consumerRunPromise).toBeNull();
  });

  it('should log debug messages when debug mode is enabled', async () => {
    process.env.KAFKA_TEST_DEBUG = 'true';
    const service = new ConsumerService(kafkaOptions);

    await service.connect();

    expect(consoleLogSpy).toHaveBeenCalledWith('[kafka-consumer] connect:start');
    expect(consoleLogSpy).toHaveBeenCalledWith('[kafka-consumer] connect:consumerConnected');
    expect(consoleLogSpy).toHaveBeenCalledWith('[kafka-consumer] connect:adminConnected');
  });

  it('should throw when the consumer group join times out', async () => {
    setTimeoutSpy.mockImplementation((callback: Parameters<typeof setTimeout>[0]) => {
      if (typeof callback === 'function') {
        setImmediate(callback);
      }

      return 0 as never;
    });
    clearTimeoutSpy.mockImplementation(vi.fn());
    const service = new ConsumerService(kafkaOptions);

    await expect(asInternal(service).waitForGroupJoin()).rejects.toThrow(
      'Consumer group join timed out after 5000ms',
    );
  });

  it.each([
    ['earliest', '3'],
    [new Date(1_700_000_000_000), '1700000000000'],
    [42, '42'],
  ] as const)('should resolve the seek offset for %s', (seekPoint, expected) => {
    const service = new ConsumerService(kafkaOptions);
    expect(
      asInternal(service).resolveSeekOffset(seekPoint, { partition: 0, offset: '9', low: '3' }),
    ).toBe(expected);
  });

  it('should retry seek until it succeeds', async () => {
    useImmediateTimeouts();
    consumerMock.seek.mockImplementationOnce(() => {
      throw new Error('seek not ready');
    });

    const service = new ConsumerService(kafkaOptions);

    await expect(asInternal(service).seekWithRetry('testTopic', 0, '10')).resolves.toBeUndefined();
    expect(consumerMock.seek).toHaveBeenCalledTimes(2);
  });

  it('should throw the last seek error after exhausting all retry attempts', async () => {
    useImmediateTimeouts();
    consumerMock.seek.mockImplementation(() => {
      throw new Error('seek failed');
    });

    const service = new ConsumerService(kafkaOptions);
    const expectedAttempts = ConsumerServiceStatic.SEEK_RETRY_ATTEMPTS;

    await expect(asInternal(service).seekWithRetry('testTopic', 0, '10')).rejects.toThrow(
      'seek failed',
    );
    expect(consumerMock.seek).toHaveBeenCalledTimes(expectedAttempts);
  });

  it('should log run errors and clear the runner state', async () => {
    SUBSCRIBER_MAP.set('testTopic', vi.fn());
    SUBSCRIBER_OBJECT_MAP.set('testTopic', {});

    consumerMock.run.mockRejectedValue(new Error('runner crashed'));

    const service = new ConsumerService({
      ...kafkaOptions,
      seek: { testTopic: 'earliest' },
    });

    setImmediate(() => {
      consumerEventListeners.get('consumer.group_join')?.();
    });

    await service.bindAllTopicToConsumer();
    await Promise.resolve();

    const internal = asInternal(service);
    expect(internal.consumerRunning).toBe(false);
    expect(internal.consumerRunPromise).toBeNull();
    expect(consumerMock.run).toHaveBeenCalledTimes(1);
    expect(loggerErrorSpy).toHaveBeenCalledWith('Kafka consumer run failed: runner crashed');
  });

  it('should log a non-Error run failure and clear the runner state', async () => {
    SUBSCRIBER_MAP.set('testTopic', vi.fn());
    SUBSCRIBER_OBJECT_MAP.set('testTopic', {});

    consumerMock.run.mockRejectedValue('runner crashed');

    const service = new ConsumerService(kafkaOptions);

    setImmediate(() => {
      consumerEventListeners.get('consumer.group_join')?.();
    });

    await service.bindAllTopicToConsumer();
    await Promise.resolve();

    const internal = asInternal(service);
    expect(internal.consumerRunning).toBe(false);
    expect(internal.consumerRunPromise).toBeNull();
  });

  it('should not reconnect consumer or admin when already connected', async () => {
    const service = new ConsumerService(kafkaOptions);

    const internal = asInternal(service);
    internal.consumerConnected = true;
    internal.adminConnected = true;

    await service.connect();

    expect(consumerMock.connect).not.toHaveBeenCalled();
    expect(adminMock.connect).not.toHaveBeenCalled();
  });

  it('should bind the consumer without seeking when no seek config is provided', async () => {
    const service = new ConsumerService(kafkaOptions);

    setImmediate(() => {
      consumerEventListeners.get('consumer.group_join')?.();
    });

    await service.bindAllTopicToConsumer();
    await Promise.resolve();

    expect(consumerMock.run).toHaveBeenCalledTimes(1);
    expect(consumerMock.seek).not.toHaveBeenCalled();
  });

  it('should subscribe, run and dispatch messages to the provider instance on init', async () => {
    const handler = vi.fn(async function (this: { name: string }) {
      return this.name;
    });
    const instance = { name: 'orders-subscriber' };
    SUBSCRIBER_MAP.set('orders', handler);
    SUBSCRIBER_OBJECT_MAP.set('orders', instance);

    const service = new ConsumerService({ ...kafkaOptions, subscribe: { fromBeginning: true } });
    setImmediate(() => consumerEventListeners.get('consumer.group_join')?.());

    await service.onModuleInit();

    expect(adminMock.fetchTopicOffsets).toHaveBeenCalledWith('orders');
    expect(consumerMock.subscribe).toHaveBeenCalledWith({
      topics: ['orders'],
      fromBeginning: true,
    });
    expect(service.isConsumerConnected()).toBe(true);

    const { eachMessage } = consumerMock.run.mock.calls[0][0] as {
      eachMessage: (payload: unknown) => Promise<void>;
    };
    await eachMessage({
      topic: 'orders',
      partition: 0,
      message: {
        key: Buffer.from('k1'),
        value: Buffer.from('{"id":1}'),
        offset: '5',
        timestamp: '1625097600000',
        headers: { h: Buffer.from('v') },
      },
    });

    expect(handler).toHaveBeenCalledWith({
      key: 'k1',
      value: { id: 1 },
      offset: '5',
      timestamp: '1625097600000',
      headers: { h: 'v' },
      partition: 0,
    });
    expect(handler.mock.contexts[0]).toBe(instance);

    await service.onModuleDestroy();
    expect(consumerMock.disconnect).toHaveBeenCalledTimes(1);
    expect(adminMock.disconnect).toHaveBeenCalledTimes(1);
  });

  describe('subscriber instances', () => {
    class OrdersSubscriber {}
    class OtherSubscriber {}
    const resolve = (service: ConsumerService) =>
      (service as unknown as { resolveSubscriberInstances(): void }).resolveSubscriberInstances();

    afterEach(() => SUBSCRIBER_CLASS_MAP.clear());

    it('should bind each topic handler to its provider instance from the DI container', () => {
      const instance = new OrdersSubscriber();
      const moduleRef = { get: vi.fn().mockReturnValue(instance) };
      SUBSCRIBER_CLASS_MAP.set('orders', OrdersSubscriber);

      resolve(new ConsumerService(kafkaOptions, moduleRef as any));

      expect(moduleRef.get).toHaveBeenCalledWith(OrdersSubscriber, { strict: false });
      expect(SUBSCRIBER_OBJECT_MAP.get('orders')).toBe(instance);
    });

    it('should keep instances registered manually and skip classes not found in the container', () => {
      const manual = {};
      const moduleRef = {
        get: vi.fn(() => {
          throw new Error('not found');
        }),
      };
      SUBSCRIBER_OBJECT_MAP.set('orders', manual);
      SUBSCRIBER_CLASS_MAP.set('orders', OrdersSubscriber);
      SUBSCRIBER_CLASS_MAP.set('other', OtherSubscriber);

      resolve(new ConsumerService(kafkaOptions, moduleRef as any));

      expect(SUBSCRIBER_OBJECT_MAP.get('orders')).toBe(manual);
      expect(SUBSCRIBER_OBJECT_MAP.has('other')).toBe(false);
      expect(moduleRef.get).toHaveBeenCalledTimes(1);
    });

    it('should not register anything when the container returns no instance', () => {
      const moduleRef = { get: vi.fn().mockReturnValue(undefined) };
      SUBSCRIBER_CLASS_MAP.set('other', OtherSubscriber);

      resolve(new ConsumerService(kafkaOptions, moduleRef as any));

      expect(SUBSCRIBER_OBJECT_MAP.has('other')).toBe(false);
    });

    it('should do nothing without a ModuleRef', () => {
      SUBSCRIBER_CLASS_MAP.set('other', OtherSubscriber);

      resolve(new ConsumerService(kafkaOptions));

      expect(SUBSCRIBER_OBJECT_MAP.size).toBe(0);
    });
  });
});
