import {
  DeleteMessageCommand,
  ListQueuesCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

import { AwsSqsService } from '..';
import { AwsSqsModuleOptions } from '../aws-sqs/interfaces/aws-sqs.interface';

describe('AwsSqsService', () => {
  let service: AwsSqsService;
  let sendMock: jest.SpyInstance;

  const endpoint = 'http://localhost:4566';
  const queueNames = ['orders', 'notifications'];
  const queueUrls = queueNames.map((queueName) => `${endpoint}/000000000000/${queueName}`);
  const messagesByQueue = new Map<string, any[]>();
  const messageBody = { orderId: 1, product: 'Laptop' };
  const options: AwsSqsModuleOptions = {
    endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
    queues: queueNames.map((queueName) => ({
      name: queueName,
      url: `${endpoint}/000000000000/${queueName}`,
    })),
  };

  beforeEach(() => {
    messagesByQueue.clear();
    queueUrls.forEach((queueUrl) => messagesByQueue.set(queueUrl, []));

    sendMock = jest.spyOn(SQSClient.prototype, 'send').mockImplementation(async (command: any) => {
      if (command instanceof ListQueuesCommand) {
        return { QueueUrls: queueUrls };
      }

      if (command instanceof SendMessageCommand) {
        const messages = messagesByQueue.get(command.input.QueueUrl) || [];
        messages.push({
          MessageId: `${messages.length + 1}`,
          Body: command.input.MessageBody,
          ReceiptHandle: `receipt-${messages.length + 1}`,
        });
        messagesByQueue.set(command.input.QueueUrl, messages);
        return {};
      }

      if (command instanceof ReceiveMessageCommand) {
        return { Messages: messagesByQueue.get(command.input.QueueUrl) || [] };
      }

      if (command instanceof DeleteMessageCommand) {
        const messages = messagesByQueue.get(command.input.QueueUrl) || [];
        messagesByQueue.set(
          command.input.QueueUrl,
          messages.filter((message) => message.ReceiptHandle !== command.input.ReceiptHandle),
        );
        return {};
      }

      return {};
    });

    service = new AwsSqsService(options);
  });

  afterEach(() => {
    sendMock.mockRestore();
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
      const body = { orderId: 123 };
      await service.sendMessage({
        queueName: queueNames[0],
        messageBody: body,
      });

      const messages = await service.receiveMessage(queueNames[0]);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages[0].Body).toEqual(JSON.stringify(body));
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

      const messages = await service.receiveMessage(queueNames[0]);
      expect(messages.length).toBeGreaterThan(0);

      await service.deleteMessage(queueNames[0], messages[0].ReceiptHandle);

      expect(await service.receiveMessage(queueNames[0])).toEqual([]);
    });

    it('should throw an error if the queue does not exist', async () => {
      await expect(service.deleteMessage('nonexistent', 'abc')).rejects.toThrow(
        'Queue "nonexistent" not found',
      );
    });
  });

  describe('SQS Client', () => {
    it('should list available queues', async () => {
      const sqsClient = new SQSClient(options);
      const result = await sqsClient.send(new ListQueuesCommand({}));

      expect(result.QueueUrls.length).toBeGreaterThan(0);
      expect(result.QueueUrls).toContain(queueUrls[0]);
      expect(result.QueueUrls).toContain(queueUrls[1]);
    });
  });
});
