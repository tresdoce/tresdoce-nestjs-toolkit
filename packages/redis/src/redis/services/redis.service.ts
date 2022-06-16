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
   * @Descripción: Return echo message
   * @Param msg {string}
   * @return: String
   */
  public async echo(msg: string): Promise<string> {
    if (!this.client) {
      this.getClient();
    }

    return await this.client.echo(msg);
  }

  /**
   * @Descripción: Return if exist key in Redis
   * @Param key {string}
   * @return: true | false
   */
  public async exists(key: string): Promise<boolean> {
    if (!this.client) {
      this.getClient();
    }

    return Boolean(await this.client.exists(key));
  }

  /**
   * @Descripción: Save value in Redis
   * @Param key {string}
   * @Param Value {any}
   * @Param Seconds {number} expire data
   * @return: OK
   */
  public async set(key: string, value: any, seconds?: number): Promise<string> {
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
   * @return:
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
   * @return: true | false
   */
  public async del(key: string): Promise<boolean> {
    if (!this.client) {
      this.getClient();
    }
    return Boolean(await this.client.del(key));
  }

  /**
   * @Descripción: Copy value in new key
   * @param source {string}
   * @param destination {string}
   * @return: true | false
   */
  public async copy(source: string, destination: string): Promise<boolean> {
    if (!this.client) {
      this.getClient();
    }

    return await this.client.copy(source, destination);
  }

  /**
   * @Descripción: Rename key
   * @param key {string}
   * @param newKey {string}
   * @return: OK
   */
  public async rename(key: string, newKey: string): Promise<string> {
    if (!this.client) {
      this.getClient();
    }

    return await this.client.rename(key, newKey);
  }

  /**
   * @Descripción: Delete all Redis
   * @return: OK
   */
  public async flushAll(): Promise<string> {
    if (!this.client) {
      this.getClient();
    }
    return await this.client.flushAll();
  }
}
