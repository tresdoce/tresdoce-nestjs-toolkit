import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import { SQSClient, CreateQueueCommand, ListQueuesCommand } from '@aws-sdk/client-sqs';

import { AwsSqsModule, AwsSqsService } from '..';

describe('AwsSqsService', () => {
  let service: AwsSqsService;
  const endpoint: string = 'http://localhost:4566';
  const queueNames: string[] = ['orders', 'notifications'];
  const messageBody: object = { orderId: 1, product: 'Laptop' };

  const sqsClient: SQSClient = new SQSClient({
    endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });

  const createQueues = async (queueNames: string[]): Promise<void> => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}));

    const existingQueueUrls: string[] = existingQueues.QueueUrls || [];

    for (const queueName of queueNames) {
      const queueExists: boolean = existingQueueUrls.some((url: string) => url.includes(queueName));

      if (!queueExists) {
        await sqsClient.send(new CreateQueueCommand({ QueueName: queueName }));
      }
    }
  };

  beforeAll(async (): Promise<void> => {
    await createQueues(queueNames);
  });

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              sqs: {
                region: 'us-east-1',
                endpoint,
                credentials: {
                  accessKeyId: 'test',
                  secretAccessKey: 'test',
                },
                queues: queueNames.map((queueName) => ({
                  name: queueName,
                  url: `${endpoint}/000000000000/${queueName}`,
                })),
              },
            }),
          ],
        }),
        AwsSqsModule,
      ],
      providers: [AwsSqsService],
    }).compile();

    service = module.get<AwsSqsService>(AwsSqsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      await service.sendMessage({
        queueName: queueNames[0],
        messageBody,
      });

      const messages = await service.receiveMessage(queueNames[0]);
      expect(messages[0].Body).toEqual(JSON.stringify(messageBody));
    });

    it('should throw an error if the queue does not exist', async () => {
      await expect(
        service.sendMessage({
          queueName: 'nonexistent',
          messageBody: 'test message',
        }),
      ).rejects.toThrow('Queue "nonexistent" not found');
    });

    it('should throw an error if the message body is not a string or object', async () => {
      await expect(
        service.sendMessage({
          queueName: queueNames[0],
          // @ts-ignore
          messageBody: 12345,
        }),
      ).rejects.toThrow('Message body must be a string or a non-null object');
    });
  });

  describe('receiveMessage', () => {
    it('should receive messages from a queue', async () => {
      const messageBody: object = { orderId: 123 };
      await service.sendMessage({
        queueName: queueNames[0],
        messageBody,
      });

      const messages = await service.receiveMessage(queueNames[0]);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].Body).toEqual(JSON.stringify(messageBody));
    });

    it('should return an empty array if no messages are found', async () => {
      const messages = await service.receiveMessage(queueNames[1]);
      expect(messages).toEqual([]);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message successfully', async () => {
      await service.sendMessage({
        queueName: queueNames[0],
        messageBody: JSON.stringify(messageBody),
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const messages = await service.receiveMessage(queueNames[0]);
      expect(messages.length).toBeGreaterThan(0);

      const message = messages[0];
      //console.log(`Message received: ${JSON.stringify(message)}`);

      await service.deleteMessage(queueNames[0], message.ReceiptHandle!);

      let remainingMessages = [];
      for (let i = 0; i < 5; i++) {
        remainingMessages = await service.receiveMessage(queueNames[0]);
        if (remainingMessages.length === 0) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      //console.log(`Remaining messages: ${JSON.stringify(remainingMessages)}`);
      expect(remainingMessages).toEqual([]);
    }, 60000);

    it('should throw an error if the queue does not exist', async () => {
      await expect(service.deleteMessage('nonexistent', 'abc')).rejects.toThrow(
        'Queue "nonexistent" not found',
      );
    });
  });

  describe('SQS Client', () => {
    it('should list available queues', async () => {
      const result = await sqsClient.send(new ListQueuesCommand({}));
      expect(result.QueueUrls.length).toBeGreaterThan(0);
      expect(result.QueueUrls).toContain(
        `http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/${queueNames[0]}`,
      );
      expect(result.QueueUrls).toContain(
        `http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/${queueNames[1]}`,
      );
    });
  });
});
