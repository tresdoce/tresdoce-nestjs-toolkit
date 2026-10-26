import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

import { REDIS_CLIENT } from '../constants/redis.constants.js';

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
   * @Param value {unknown} se serializa con JSON.stringify
   * @Param seconds {number} expire data (solo si es un número finito > 0)
   * @return: OK
   */
  public async set(key: string, value: unknown, seconds?: number): Promise<any> {
    const stringValue = JSON.stringify(value);
    return Number.isFinite(seconds) && seconds > 0
      ? await this.clientRef.setEx(key, seconds, stringValue)
      : await this.clientRef.set(key, stringValue);
  }

  /**
   * @Descripción: Get value of Redis by key
   * @param key {string}
   * @return: valor parseado con JSON.parse, el string crudo si no es JSON válido, o null
   */
  public async get<T = any>(key: string): Promise<T | null> {
    const data = await this.clientRef.get(key);
    if (data === null || data === undefined || data === '') return null;
    try {
      return JSON.parse(data as string) as T;
    } catch {
      // Valor no escrito por este servicio (no es JSON): se devuelve tal cual.
      return data as T;
    }
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
    const result: number = await this.clientRef.copy(source, destination);
    return result === 1;
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
