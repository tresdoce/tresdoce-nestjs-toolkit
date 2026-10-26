import type { RedisClientOptions } from 'redis';

export interface RedisOptions extends RedisClientOptions {
  /** `redis` (default) or `rediss` (TLS). */
  protocol?: string;
  port: number;
  host: string;
}
