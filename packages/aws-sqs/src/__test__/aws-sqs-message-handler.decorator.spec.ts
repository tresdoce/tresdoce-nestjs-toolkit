import { Reflector } from '@nestjs/core';
import { AwsSqsMessageHandler } from '../aws-sqs/decorators/aws-sqs-message-handler.decorator';
import { AWS_SQS_MESSAGE_HANDLER } from '../aws-sqs/constants/aws-sqs.constant';

describe('AwsSqsMessageHandler Decorator', () => {
  const reflector = new Reflector();

  it('should set metadata with the correct queue name', () => {
    class TestClass {
      @AwsSqsMessageHandler('orders')
      handleOrderMessage(): void {}
    }

    const metadata = reflector.get(AWS_SQS_MESSAGE_HANDLER, TestClass.prototype.handleOrderMessage);

    expect(metadata).toBe('orders');
  });

  it('should set metadata with a different queue name', () => {
    class TestClass {
      @AwsSqsMessageHandler('notifications')
      handleNotificationMessage(): void {}
    }

    const metadata = reflector.get(
      AWS_SQS_MESSAGE_HANDLER,
      TestClass.prototype.handleNotificationMessage,
    );

    expect(metadata).toBe('notifications');
  });
});
