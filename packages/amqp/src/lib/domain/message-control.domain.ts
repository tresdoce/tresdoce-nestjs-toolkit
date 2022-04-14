import { jsonStringify } from '@dollarsign/utils';
import { AmqpError, EventContext, Message } from 'rhea-promise';

export class MessageControl {
  // private readonly logger = getLogger();
  private handled = false;

  constructor(private readonly eventContext: EventContext) {}

  public accept(): void {
    if (!this.handled) {
      this.eventContext.delivery.accept();
      this.handleSettlement();
    }
  }

  /**
   * @param reason - reject description
   */
  public reject(reason: string | Error | Record<string, unknown>): void {
    if (!this.handled) {
      const message = jsonStringify(reason);
      const { message_id } = this.eventContext.message;
      const { address } = this.eventContext.receiver;
      // this.logger.warn(`Rejecting '${address}' id: ${message_id}`, message);
      //console.log(`Rejecting '${address}' id: ${message_id}`, message);
      const error: AmqpError = {
        condition: 'amqp:precondition-failed',
        description: message,
      };
      this.eventContext.delivery.reject(error);
      this.handleSettlement();
    }
  }

  public release(): void {
    if (!this.handled) {
      const { message_id } = this.eventContext.message;
      const { address } = this.eventContext.receiver;
      // this.logger.silly(`Releasing '${address}' id: ${message_id}`);
      //console.log(`Releasing '${address}' id: ${message_id}`);
      this.eventContext.delivery.release({
        undeliverable_here: true,
        delivery_failed: false,
      });
      this.handleSettlement();
    }
  }

  private handleSettlement(): void {
    this.eventContext.receiver.addCredit(1);
    this.handled = true;
  }

  public get isHandled(): boolean {
    return this.handled;
  }

  public get context(): EventContext {
    return this.eventContext;
  }

  public get message(): Message {
    return this.eventContext?.message;
  }
}
