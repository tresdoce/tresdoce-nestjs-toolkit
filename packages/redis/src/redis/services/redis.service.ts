import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import { REDIS_CLIENT } from '../constants/redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  get clientRef(): RedisClientType {
    return this.redisClient;
  }

  /**
   * @Descripción: Return echo message
   * @Param msg {string}
   * @return: String
   */
  public async echo(msg: string): Promise<string> {
    return this.clientRef.echo(msg);
  }

  /**
   * @Descripción: Return if exist key in Redis
   * @Param key {string}
   * @return: true | false
   */
  public async exists(key: string): Promise<boolean> {
    return Boolean(await this.clientRef.exists(key));
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
    return !seconds ? this.clientRef.set(key, value) : this.clientRef.setEx(key, seconds, value);
  }

  /**
   * @Descripción: Get value of Redis by key
   * @param key {string}
   * @return:
   */
  public async get(key: string): Promise<any> {
    const data = await this.clientRef.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * @Descripción: Delete data of Redis by key
   * @param key {string}
   * @return: true | false
   */
  public async del(key: string): Promise<boolean> {
    return Boolean(await this.clientRef.del(key));
  }

  /**
   * @Descripción: Copy value in new key
   * @param source {string}
   * @param destination {string}
   * @return: true | false
   */
  public async copy(source: string, destination: string): Promise<boolean> {
    return this.clientRef.copy(source, destination);
  }

  /**
   * @Descripción: Rename key
   * @param key {string}
   * @param newKey {string}
   * @return: OK
   */
  public async rename(key: string, newKey: string): Promise<string> {
    return this.clientRef.rename(key, newKey);
  }

  /**
   * @Descripción: Delete all Redis
   * @return: OK
   */
  public async flushAll(): Promise<string> {
    return this.clientRef.flushAll();
  }
}
