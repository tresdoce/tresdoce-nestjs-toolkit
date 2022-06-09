import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

import { REDIS_CLIENT } from '../constants/redis.constants';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: RedisClientType) {}

  /**
   * @Descripción: Método para guardar en caché
   * @Param key {string} valor clave
   * @Param Value {String} Valor clave
   * @Param segundos {número} expiró
   * @return: Promise<any>
   */
  public async set(key: string, value: any, seconds?: number): Promise<any> {
    value = JSON.stringify(value);
    if (!seconds) {
      await this.redisClient.set(key, value);
    } else {
      await this.redisClient.setEx(key, seconds, value);
    }
  }

  /**
   * @Descripción: Obtener el valor del caché
   * @param key {String}
   */
  public async get(key: string): Promise<any> {
    const data = await this.redisClient.get(key);

    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  /**
   * @Descripción: Eliminar datos de caché
   * @param key {String}
   * @return:
   */
  public async del(key: string): Promise<any> {
    await this.redisClient.del(key);
  }

  /**
   * @Descripción: Borrar el Redis
   * @return:
   */
  public async flushAll(): Promise<any> {
    await this.redisClient.flushAll();
  }
}
