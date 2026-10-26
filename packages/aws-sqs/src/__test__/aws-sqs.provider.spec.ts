import { Inject, Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  AWS_SQS_QUEUE_PROVIDERS,
  AwsSqsModule,
  getAwsSqsQueueToken,
  type AwsSqsModuleOptions,
  type QueueConfig,
} from '../index.js';
import {
  createQueueProviders,
  createQueueValueProviders,
} from '../aws-sqs/providers/aws-sqs.provider.js';

const endpoint = 'http://localhost:4566';
const options: AwsSqsModuleOptions = {
  region: 'us-east-1',
  endpoint,
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' },
  queues: [{ name: 'orders', url: `${endpoint}/000000000000/orders` }],
};

@Injectable()
class OrdersService {
  constructor(@Inject(getAwsSqsQueueToken('orders')) readonly queue: QueueConfig) {}
}

describe('AwsSqs queue providers', () => {
  it('should build the queue token', () => {
    expect(getAwsSqsQueueToken('orders')).toBe('AWS_SQS_QUEUE_ORDERS');
  });

  it('should return no providers without queues', () => {
    expect(createQueueValueProviders()).toEqual([]);
    const [provider] = createQueueProviders() as any[];
    expect(provider.provide).toBe(AWS_SQS_QUEUE_PROVIDERS);
    expect(provider.useFactory(undefined)).toEqual([]);
  });

  it.each([
    ['register', AwsSqsModule.register.bind(AwsSqsModule)],
    ['forRoot', AwsSqsModule.forRoot.bind(AwsSqsModule)],
  ])('should inject each queue with %s', async (_name, factory) => {
    const moduleRef = await Test.createTestingModule({
      imports: [factory(options)],
      providers: [OrdersService],
    }).compile();

    expect(moduleRef.get(OrdersService).queue).toEqual(options.queues[0]);
    expect(moduleRef.get(AWS_SQS_QUEUE_PROVIDERS)).toEqual([
      { provide: 'AWS_SQS_QUEUE_ORDERS', useValue: options.queues[0] },
    ]);
    await moduleRef.close();
  });

  it('should register without queues', () => {
    const dynamicModule = AwsSqsModule.register(undefined);
    expect(dynamicModule.exports).toHaveLength(3);
  });
});
