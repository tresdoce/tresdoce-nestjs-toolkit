import { RedisClientOptions } from 'redis';

export interface RedisOptions extends RedisClientOptions {
  protocol: string;
  host: string;
  port: number;
}
