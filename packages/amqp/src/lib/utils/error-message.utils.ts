import { jsonStringify } from '@dollarsign/utils';
import { AmqpError, EventContext } from 'rhea-promise';

export class ErrorMessage {
  /**
   * @param value - data value
   * @returns string value or `undefined`
   */
  public static toString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    return value ? jsonStringify(value) : undefined;
  }

  /**
   * @param error - `Error`
   * @returns error message
   */
  public static fromError(error: Error): string {
    return this.toString(error?.message);
  }

  /**
   * @param error - `Error` or `AmqpError`
   * @returns error message
   */
  public static fromErrorAmqp(error: Error | AmqpError): string {
    if (error instanceof Error) {
      return this.fromError(error);
    }
    return this.toString(error?.description);
  }

  /**
   * @param context - event context
   * @returns error message
   */
  public static fromContext(context: EventContext): string {
    return this.fromError(context?.error);
  }

  /**
   * @param context - event context
   * @returns error message
   */
  public static fromReceiver(context: EventContext): string {
    return this.fromErrorAmqp(context?.receiver?.error);
  }

  /**
   * @param context - event context
   * @returns error message
   */
  public static fromSender(context: EventContext): string {
    return this.fromErrorAmqp(context?.sender?.error);
  }
}
