import { Test, TestingModule } from '@nestjs/testing';
import { Reflector, ModulesContainer } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Message } from '@aws-sdk/client-sqs';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { AwsSqsListener } from '../aws-sqs/aws-sqs.listener.js';
import { AwsSqsService } from '../aws-sqs/services/aws-sqs.service.js';
import { AwsSqsModule } from '../aws-sqs/aws-sqs.module.js';
import { AWS_SQS_MESSAGE_HANDLER } from '../aws-sqs/constants/aws-sqs.constant.js';
import { AwsSqsMessageHandler } from '../aws-sqs/decorators/aws-sqs-message-handler.decorator.js';

describe('AwsSqsListener (Integration)', () => {
  let listener: AwsSqsListener;
  let service: AwsSqsService;
  const endpoint: string = 'http://localhost:4566';
  const queueNames: string[] = ['orders', 'notifications'];
  const messageBody: string = 'Test message';

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
      const getMessageHandlersSpy = vi
        .spyOn(listener as any, 'getMessageHandlers')
        .mockReturnValue([{ queueName: queueNames[0], handler: vi.fn() }]);

      const listenToQueueSpy = vi
        .spyOn(listener as any, 'listenToQueue')
        .mockImplementation(async () => Promise.resolve());

      await listener.onModuleInit();

      expect(getMessageHandlersSpy).toHaveBeenCalled();
      expect(listenToQueueSpy).toHaveBeenCalledWith(queueNames[0], expect.any(Function));
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop the listener and log a message', () => {
      const loggerSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);

      listener.onModuleDestroy();

      expect((listener as any).isListening).toBe(false);
      expect(loggerSpy).toHaveBeenCalledWith('SQS Listener stopped.');
    });
  });

  describe('listenToQueue', () => {
    it('should process messages and delete them after handling', async () => {
      const mockHandler = vi.fn();
      const message: Message = {
        MessageId: '1',
        Body: messageBody,
        ReceiptHandle: 'abc',
      } as Message;

      vi.spyOn(service, 'receiveMessage').mockResolvedValue([message]);
      vi.spyOn(service, 'deleteMessage').mockResolvedValue(undefined);

      await (listener as any).listenToQueue(queueNames[0], mockHandler);

      expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({ Body: messageBody }));
      expect(service.deleteMessage).toHaveBeenCalledWith(queueNames[0], 'abc');
    });

    it('should log an error if message processing fails', async () => {
      const error = new Error('Handler failed');
      const loggerSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      const mockHandler = vi.fn().mockRejectedValue(error);

      const message: Message = {
        MessageId: '1',
        Body: messageBody,
        ReceiptHandle: 'abc',
      } as Message;

      vi.spyOn(service, 'receiveMessage').mockResolvedValue([message]);

      await (listener as any).listenToQueue(queueNames[0], mockHandler);

      expect(loggerSpy).toHaveBeenCalledWith(`Error processing message 1: ${error.message}`);
    });

    it('should not delete a message without ReceiptHandle', async () => {
      const mockHandler = vi.fn();
      const message: Message = { MessageId: '2', Body: messageBody } as Message;

      vi.spyOn(service, 'receiveMessage').mockResolvedValue([message]);
      const deleteSpy = vi.spyOn(service, 'deleteMessage').mockResolvedValue(undefined);

      await (listener as any).listenToQueue(queueNames[0], mockHandler);

      expect(mockHandler).toHaveBeenCalledWith(message);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('should log if no messages are received', async () => {
      const loggerSpy = vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
      vi.spyOn(service, 'receiveMessage').mockResolvedValue([]); // No hay mensajes

      await (listener as any).listenToQueue(queueNames[0], vi.fn());

      expect(loggerSpy).toHaveBeenCalledWith(`No messages received from ${queueNames[0]}.`);
    });

    it('should log an error if polling the queue fails', async () => {
      const error = new Error('Polling failed');
      const loggerSpy = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      vi.spyOn(service, 'receiveMessage').mockRejectedValue(error);

      await (listener as any).listenToQueue(queueNames[0], vi.fn());

      expect(loggerSpy).toHaveBeenCalledWith(
        `Error polling queue ${queueNames[0]}: ${error.message}`,
      );
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

      vi.spyOn(listener['modulesContainer'], 'forEach').mockImplementation((callback: any) => {
        const controllers = new Map<string, { instance: any }>([
          ['TestController', { instance: testController }],
        ]);
        callback({ controllers } as any);
      });

      vi.spyOn(listener['reflector'], 'get').mockImplementation((metadataKey, target) => {
        if (
          metadataKey === AWS_SQS_MESSAGE_HANDLER &&
          target === testController.handleOrderMessage
        ) {
          return queueNames[0];
        }
        return undefined;
      });

      const loggerSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
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

    it('should skip controllers without instance and never invoke getters', () => {
      const getterSpy = vi.fn(() => 'value');
      class GetterController {
        get computed(): string {
          return getterSpy();
        }

        @AwsSqsMessageHandler(queueNames[1])
        handleNotification(): void {}

        notAHandler(): void {}
      }

      vi.spyOn(listener['modulesContainer'], 'forEach').mockImplementation((callback: any) => {
        const controllers = new Map<string, { instance: any }>([
          ['Unresolved', { instance: undefined }],
          ['GetterController', { instance: new GetterController() }],
        ]);
        callback({ controllers } as any);
      });

      const handlers = (listener as any).getMessageHandlers();

      expect(handlers).toHaveLength(1);
      expect(handlers[0].queueName).toBe(queueNames[1]);
      expect(getterSpy).not.toHaveBeenCalled();
    });
  });
});
