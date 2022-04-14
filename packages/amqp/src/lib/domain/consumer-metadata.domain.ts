import { ConsumerOptions } from '../interfaces/amqp.interfaces';

export class ConsumerMetadata {
  public callback: () => unknown;
  public callbackName: string;
  public source: string;
  public options: ConsumerOptions;
  public targetName: string;
  public connectionToken: string;
  public consumerToken: string;
  public target: any;
}
