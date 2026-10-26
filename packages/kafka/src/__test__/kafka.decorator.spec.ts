import { SubscribeTo, SUBSCRIBER_MAP } from '../kafka/decorators/kafka.decorator.js';
import type { IHeaders } from '../kafka/interfaces/kafka.interface.js';

interface TestRouteResult {
  data: unknown;
  key: string;
  offset: number;
  timestamp: number;
  partition: number;
  headers: IHeaders;
}

describe('Kafka Decorator', () => {
  it('should apply SubscribeTo to a route', async () => {
    class TestController {
      @SubscribeTo('testTopicA')
      async testRoute(
        data: unknown,
        key: string,
        offset: number,
        timestamp: number,
        partition: number,
        headers: IHeaders,
      ): Promise<TestRouteResult> {
        return { data, key, offset, timestamp, partition, headers };
      }
    }

    const testInstance = new TestController();
    const mappedMethod = SUBSCRIBER_MAP.get('testTopicA');

    const testData = { message: 'Hello, world!' };
    const testKey = 'testKey';
    const testOffset = 123;
    const testTimestamp = Date.now();
    const testPartition = 0;
    const testHeaders: IHeaders = { header1: 'value1' };

    const result = (await mappedMethod?.apply(testInstance, [
      testData,
      testKey,
      testOffset,
      testTimestamp,
      testPartition,
      testHeaders,
    ])) as TestRouteResult;

    expect(mappedMethod).toBeDefined();
    expect(mappedMethod).toEqual(testInstance.testRoute);
    expect(result.data).toEqual(testData);
    expect(result.key).toEqual(testKey);
    expect(result.offset).toEqual(testOffset);
    expect(result.timestamp).toEqual(testTimestamp);
    expect(result.partition).toEqual(testPartition);
    expect(result.headers).toEqual(testHeaders);
  });
});
