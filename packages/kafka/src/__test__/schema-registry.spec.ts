import type { MockInstance } from 'vitest';
import { join } from 'path';

const mockRegistry = {
  register: vi.fn(),
  getLatestSchemaId: vi.fn(),
  encode: vi.fn(),
};

const readAVSCAsyncImplementation = () => Promise.resolve({ type: 'record', name: 'TestSchema' });
const readAVSCAsyncMock = vi.fn(readAVSCAsyncImplementation);

vi.mock('@kafkajs/confluent-schema-registry', () => ({
  SchemaRegistry: vi.fn().mockImplementation(function () {
    return mockRegistry;
  }),
  SchemaType: { AVRO: 'AVRO' },
  readAVSCAsync: (...args: Parameters<typeof readAVSCAsyncImplementation>) =>
    readAVSCAsyncMock(...args),
}));

import { KafkaAvroRequestSerializer } from '../kafka/serializer/kafka-avro-request.serializer.js';

const TOPIC_NAME = 'testTopic';
const dockerTestHost = process.env.DOCKER_TEST_HOST || 'docker';
const schemaRegistryHost = `http://${dockerTestHost}:8085`;

interface KafkaAvroRequestSerializerSchema {
  topic: string;
  key?: string;
  value?: string;
  keySuffix?: string;
  valueSuffix?: string;
}

interface KafkaSchemaMap {
  keyId: number | null;
  valueId: number;
  keySuffix: string;
  valueSuffix: string;
}

/** Exposes the private members of `KafkaAvroRequestSerializer` that these tests need to reach into. */
interface KafkaAvroRequestSerializerTestAccess {
  lastSchemaFetchInterval: Map<string, number>;
  schemas: Map<string, KafkaSchemaMap>;
  registerSchema(schema: KafkaAvroRequestSerializerSchema): Promise<void | Error>;
}

const asInternal = (serializer: KafkaAvroRequestSerializer): KafkaAvroRequestSerializerTestAccess =>
  serializer as unknown as KafkaAvroRequestSerializerTestAccess;

describe('KafkaAvroRequestSerializer', () => {
  let serializer: KafkaAvroRequestSerializer;
  let consoleLogSpy: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.KAFKA_TEST_DEBUG;
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
    mockRegistry.register.mockResolvedValue(undefined);
    mockRegistry.getLatestSchemaId.mockResolvedValue(1);
    mockRegistry.encode.mockResolvedValue(Buffer.from('encoded'));

    serializer = new KafkaAvroRequestSerializer({
      schemas: [
        {
          topic: TOPIC_NAME,
          key: join(import.meta.dirname, 'utils/key-schema.avsc'),
          value: join(import.meta.dirname, 'utils/value-schema.avsc'),
        },
      ],
      config: { host: schemaRegistryHost },
      options: {},
    });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    delete process.env.KAFKA_TEST_DEBUG;
  });

  it('should handle schema registry errors', async () => {
    asInternal(serializer).lastSchemaFetchInterval.clear();
    mockRegistry.getLatestSchemaId
      .mockResolvedValueOnce(1)
      .mockRejectedValueOnce(new Error('Registry Error'));

    await expect(
      serializer.serialize({ topic: TOPIC_NAME, messages: [{ key: 'key', value: 'value' }] }),
    ).rejects.toThrow('Error serializing');
  });

  it('should store null schema ids when the registry returns empty values', async () => {
    await serializer.serialize({ topic: TOPIC_NAME, messages: { value: 'warm-up' } });
    mockRegistry.getLatestSchemaId.mockClear();
    mockRegistry.getLatestSchemaId.mockResolvedValueOnce(undefined);

    await asInternal(serializer).registerSchema({
      topic: 'testTopicWithoutIds',
      value: join(import.meta.dirname, 'utils/value-schema.avsc'),
    });

    expect(asInternal(serializer).schemas.get('testTopicWithoutIds')).toMatchObject({
      keyId: null,
      valueId: null,
    });
    // The key subject is not configured, so it must not be looked up (the registry would 404).
    expect(mockRegistry.getLatestSchemaId).toHaveBeenCalledTimes(1);
    expect(mockRegistry.getLatestSchemaId).toHaveBeenCalledWith('testTopicWithoutIds-value');
  });

  it('should not leak an unhandled rejection when the registry is down at startup', async () => {
    process.env.KAFKA_TEST_DEBUG = 'true';
    mockRegistry.register.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const lazy = new KafkaAvroRequestSerializer({
      schemas: [{ topic: TOPIC_NAME, value: join(import.meta.dirname, 'utils/value-schema.avsc') }],
      config: { host: schemaRegistryHost },
      options: {},
    });

    await expect(lazy.serialize({ topic: TOPIC_NAME, messages: { value: 'v' } })).resolves.toEqual({
      value: Buffer.from('encoded'),
    });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[kafka-serializer] initializeSchemas:error:Unable to register schema ID: ECONNREFUSED',
    );
    // The failed startup registration is retried lazily by `serialize()`.
    expect(mockRegistry.register).toHaveBeenLastCalledWith(expect.anything(), {
      subject: `${TOPIC_NAME}-value`,
    });
  });

  it('should log non-Error startup failures', async () => {
    process.env.KAFKA_TEST_DEBUG = 'true';
    readAVSCAsyncMock.mockRejectedValueOnce('bad schema');

    const lazy = new KafkaAvroRequestSerializer({
      schemas: [{ topic: TOPIC_NAME, value: 'missing.avsc' }],
      config: { host: schemaRegistryHost },
      options: {},
    });
    await expect(
      lazy.serialize({ topic: TOPIC_NAME, messages: { value: 'v' } }),
    ).resolves.toBeDefined();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[kafka-serializer] initializeSchemas:error:Unable to register schema ID: bad schema',
    );
  });

  it('should only look up the key subject for key-only schemas', async () => {
    await serializer.serialize({ topic: TOPIC_NAME, messages: { value: 'warm-up' } });
    mockRegistry.getLatestSchemaId.mockClear();
    mockRegistry.getLatestSchemaId.mockResolvedValueOnce(undefined);

    await asInternal(serializer).registerSchema({
      topic: 'keyOnlyTopic',
      key: join(import.meta.dirname, 'utils/key-schema.avsc'),
    });

    expect(mockRegistry.getLatestSchemaId).toHaveBeenCalledTimes(1);
    expect(mockRegistry.getLatestSchemaId).toHaveBeenCalledWith('keyOnlyTopic-key');
    expect(asInternal(serializer).schemas.get('keyOnlyTopic')).toMatchObject({
      keyId: null,
      valueId: null,
    });
  });

  it('should fail clearly when the topic has no schema configured', async () => {
    await expect(
      serializer.serialize({ topic: 'unknownTopic', messages: { value: 'v' } }),
    ).rejects.toThrow('Error serializing: No Avro schema configured for topic unknownTopic');
  });

  it('should log debug messages when debug mode is enabled', () => {
    process.env.KAFKA_TEST_DEBUG = 'true';

    new KafkaAvroRequestSerializer({
      schemas: [],
      config: { host: schemaRegistryHost },
      options: {},
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('[kafka-serializer] constructor:initializeSchemas');
  });
});
