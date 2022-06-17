import { RedisClientOptions } from 'redis';

export interface RedisOptions extends RedisClientOptions {
  protocol?: string;
  port: number;
  host: string;
}
