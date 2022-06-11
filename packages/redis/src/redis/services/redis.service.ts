import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import { REDIS_CLIENT } from '../constants/redis.constants';

@Injectable()
export class RedisService {
  private client: RedisClientType;
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {
    this.getClient();
  }

  private getClient() {
    this.client = this.redisClient;
  }

  /**
   * @Descripción: Save value in Redis
   * @Param key {string}
   * @Param Value {any}
   * @Param Seconds {number} expire data
   * @return: Promise<any>
   */
  public async set(key: string, value: any, seconds?: number): Promise<any> {
    value = JSON.stringify(value);

    if (!this.client) {
      this.getClient();
    }

    if (!seconds) {
      return await this.client.set(key, value);
    } else {
      return await this.client.setEx(key, seconds, value);
    }
  }

  /**
   * @Descripción: Get value of Redis by key
   * @param key {string}
   */
  public async get(key: string): Promise<any> {
    if (!this.client) {
      this.getClient();
    }

    const data = await this.client.get(key);

    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  /**
   * @Descripción: Delete data of Redis by key
   * @param key {string}
   * @return:
   */
  public async del(key: string): Promise<any> {
    if (!this.client) {
      this.getClient();
    }
    await this.client.del(key);
  }

  /**
   * @Descripción: Delete all Redis
   * @return:
   */
  public async flushAll(): Promise<any> {
    if (!this.client) {
      this.getClient();
    }
    await this.client.flushAll();
  }
}
