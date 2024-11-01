import { Test, TestingModule } from '@nestjs/testing';
import { Reflector, ModulesContainer } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SQSClient, CreateQueueCommand, ListQueuesCommand, Message } from '@aws-sdk/client-sqs';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { AwsSqsListener } from '../aws-sqs/aws-sqs.listener';
import { AwsSqsService } from '../aws-sqs/services/aws-sqs.service';
import { AwsSqsModule } from '../aws-sqs/aws-sqs.module';
import { AWS_SQS_MESSAGE_HANDLER } from '../aws-sqs/constants/aws-sqs.constant';
import { AwsSqsMessageHandler } from '../aws-sqs/decorators/aws-sqs-message-handler.decorator';

describe('AwsSqsListener (Integration)', () => {
  let listener: AwsSqsListener;
  let service: AwsSqsService;
  const endpoint: string = 'http://docker:4566';
  const queueNames: string[] = ['orders', 'notifications'];
  const messageBody: string = 'Test message';

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

  beforeEach(async () => {
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
      providers: [AwsSqsService, AwsSqsListener, Reflector, ModulesContainer],
    }).compile();

    listener = module.get<AwsSqsListener>(AwsSqsListener);
    service = module.get<AwsSqsService>(AwsSqsService);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should discover and bind message handlers', async () => {
      const getMessageHandlersSpy = jest
        .spyOn(listener as any, 'getMessageHandlers')
        .mockReturnValue([{ queueName: queueNames[0], handler: jest.fn() }]);

      const listenToQueueSpy = jest
        .spyOn(listener as any, 'listenToQueue')
        .mockImplementation(async () => Promise.resolve());

      await listener.onModuleInit();

      expect(getMessageHandlersSpy).toHaveBeenCalled();
      expect(listenToQueueSpy).toHaveBeenCalledWith(queueNames[0], expect.any(Function));
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop the listener and log a message', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      listener.onModuleDestroy();

      expect((listener as any).isListening).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('SQS Listener stopped.');
    });
  });

  describe('listenToQueue', () => {
    it('should process messages and delete them after handling', async () => {
      const mockHandler = jest.fn();
      const message: Message = {
        MessageId: '1',
        Body: messageBody,
        ReceiptHandle: 'abc',
      } as Message;

      jest.spyOn(service, 'receiveMessage').mockResolvedValue([message]);
      jest.spyOn(service, 'deleteMessage').mockResolvedValue(undefined);

      await (listener as any).listenToQueue(queueNames[0], mockHandler);

      expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({ Body: messageBody }));
      expect(service.deleteMessage).toHaveBeenCalledWith(queueNames[0], 'abc');
    });

    it('should log an error if message processing fails', async () => {
      const error = new Error('Handler failed');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const mockHandler = jest.fn().mockRejectedValue(error);

      const message: Message = {
        MessageId: '1',
        Body: messageBody,
        ReceiptHandle: 'abc',
      } as Message;

      jest.spyOn(service, 'receiveMessage').mockResolvedValue([message]);

      await (listener as any).listenToQueue(queueNames[0], mockHandler);

      expect(loggerSpy).toHaveBeenCalledWith(`Error on queue ${queueNames[0]}: ${error.message}`);
    });

    it('should log if no messages are received', async () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      jest.spyOn(service, 'receiveMessage').mockResolvedValue([]); // No hay mensajes

      await (listener as any).listenToQueue(queueNames[0], jest.fn());

      expect(loggerSpy).toHaveBeenCalledWith(`No messages received from ${queueNames[0]}.`);
    });
  });

  describe('getMessageHandlers', () => {
    @Injectable()
    class TestController {
      @AwsSqsMessageHandler(queueNames[0])
      async handleOrderMessage(message: any): Promise<void> {
        console.log(`Processing order message: ${message.Body}`);
      }
    }

    it('should discover handlers with the AWS_SQS_MESSAGE_HANDLER metadata', () => {
      const testController = new TestController();

      jest.spyOn(listener['modulesContainer'], 'forEach').mockImplementation((callback: any) => {
        const controllers = new Map<string, { instance: any }>([
          ['TestController', { instance: testController }],
        ]);
        callback({ controllers } as any);
      });

      jest.spyOn(listener['reflector'], 'get').mockImplementation((metadataKey, target) => {
        if (
          metadataKey === AWS_SQS_MESSAGE_HANDLER &&
          target === testController.handleOrderMessage
        ) {
          return queueNames[0];
        }
        return undefined;
      });

      const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      loggerSpy.mockClear();

      const handlers = (listener as any).getMessageHandlers();

      expect(handlers).toHaveLength(1);
      expect(handlers[0]).toEqual({
        queueName: queueNames[0],
        handler: expect.any(Function),
      });

      handlers[0].handler({ Body: 'Test message' });

      expect(loggerSpy).toHaveBeenCalledWith(`Handler found for queue: ${queueNames[0]}`);

      loggerSpy.mockRestore();
    });
  });
});
