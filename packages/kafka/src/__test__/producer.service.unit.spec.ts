const { producerMock, producerListeners } = vi.hoisted(() => {
  const producerListeners = new Map<string, () => void>();
  const producerMock = {
    events: { DISCONNECT: 'producer.disconnect' },
    on: vi.fn((event: string, listener: () => void) => {
      producerListeners.set(event, listener);
      return () => producerListeners.delete(event);
    }),
    connect: vi.fn(),
    disconnect: vi.fn(),
    send: vi.fn(),
    sendBatch: vi.fn(),
  };
  return { producerMock, producerListeners };
});

vi.mock('kafkajs', () => ({
  Kafka: vi.fn(function () {
    return { producer: vi.fn(() => producerMock) };
  }),
  logLevel: { NOTHING: 0 },
  CompressionTypes: { GZIP: 1 },
  Partitioners: { LegacyPartitioner: vi.fn() },
}));

import { ProducerService } from '../kafka/services/producer.service.js';
import type { KafkaModuleOptions } from '../kafka/interfaces/kafka.interface.js';

describe('ProducerService (unit)', () => {
  const options: KafkaModuleOptions = {
    client: { clientId: 'nestjs-test', brokers: ['localhost:9092'] },
  };

  beforeEach(() => {
    producerListeners.clear();
    producerMock.connect.mockReset().mockResolvedValue(undefined);
    producerMock.disconnect.mockReset().mockResolvedValue(undefined);
    producerMock.send.mockReset().mockResolvedValue([]);
    producerMock.sendBatch.mockReset().mockResolvedValue([]);
  });

  it('should connect once and reuse the connection across sends', async () => {
    const service = new ProducerService(options);

    await Promise.all([
      service.sendMessages('topic', { key: 'k', value: { a: 1 } }),
      service.sendMessages('topic', [{ value: 'b' }]),
      service.sendBatchMessages([{ topic: 'topic', messages: [{ value: 'c' }] }]),
    ]);

    expect(producerMock.connect).toHaveBeenCalledTimes(1);
    expect(producerMock.disconnect).not.toHaveBeenCalled();
    expect(producerMock.send).toHaveBeenCalledTimes(2);
    expect(producerMock.send).toHaveBeenCalledWith({
      topic: 'topic',
      messages: [{ key: 'k', value: '{"a":1}', headers: {} }],
      acks: -1,
      timeout: 30000,
      compression: 1,
    });
    expect(producerMock.sendBatch).toHaveBeenCalledWith({
      topicMessages: [{ topic: 'topic', messages: [{ value: 'c', headers: {} }] }],
      acks: -1,
      timeout: 30000,
      compression: 1,
    });
  });

  it('should await async serializers before sending', async () => {
    const serializer = { serialize: vi.fn(async () => ({ value: 'encoded' })) };
    const service = new ProducerService({ ...options, serializer });

    await service.sendBatchMessages([{ topic: 't', messages: [{ value: 'raw' }] }]);

    expect(serializer.serialize).toHaveBeenCalledWith({ topic: 't', messages: { value: 'raw' } });
    expect(producerMock.sendBatch).toHaveBeenCalledWith(
      expect.objectContaining({
        topicMessages: [{ topic: 't', messages: [{ value: 'encoded' }] }],
      }),
    );
  });

  it('should disconnect on module destroy only when connected', async () => {
    const service = new ProducerService(options);

    await service.onModuleDestroy();
    expect(producerMock.disconnect).not.toHaveBeenCalled();

    await service.connect();
    await service.onModuleDestroy();
    expect(producerMock.disconnect).toHaveBeenCalledTimes(1);
  });

  it('should reconnect after a broker disconnect event', async () => {
    const service = new ProducerService(options);

    await service.connect();
    producerListeners.get('producer.disconnect')();
    await service.connect();

    expect(producerMock.connect).toHaveBeenCalledTimes(2);
  });

  it('should retry the connection on the next send when connecting fails', async () => {
    producerMock.connect.mockRejectedValueOnce(new Error('broker down'));
    const service = new ProducerService(options);

    const error: Error = await service.sendMessages('topic', { value: 'a' }).catch((e) => e);
    expect(error.message).toBe('Error sending message(s) to topic topic: broker down');
    expect((error.cause as Error).message).toBe('broker down');

    await service.sendMessages('topic', { value: 'a' });
    expect(producerMock.connect).toHaveBeenCalledTimes(2);
  });

  it('should wrap send errors, including non-Error values', async () => {
    const service = new ProducerService(options);
    producerMock.send.mockRejectedValueOnce('boom');
    producerMock.sendBatch
      .mockRejectedValueOnce('boom')
      .mockRejectedValueOnce(new Error('leader not available'));

    await expect(service.sendMessages('t', { value: 'a' })).rejects.toThrow(
      'Error sending message(s) to topic t: boom',
    );
    await expect(service.sendBatchMessages([{ topic: 't', messages: [] }])).rejects.toThrow(
      'Error sending batch messages: boom',
    );
    await expect(service.sendBatchMessages([{ topic: 't', messages: [] }])).rejects.toThrow(
      'Error sending batch messages: leader not available',
    );
  });
});
