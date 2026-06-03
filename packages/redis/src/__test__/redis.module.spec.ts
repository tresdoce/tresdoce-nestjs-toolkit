import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { REDIS_CLIENT } from '../redis/constants/redis.constants';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/services/redis.service';
import { config } from './utils';

describe('RedisModule', () => {
  let app: INestApplication;
  let redisClient: { quit: jest.Mock };

  const createApp = async (imports: any[]) => {
    redisClient = {
      quit: jest.fn().mockResolvedValue('OK'),
    };

    const module: TestingModule = await Test.createTestingModule({ imports })
      .overrideProvider(REDIS_CLIENT)
      .useValue(redisClient)
      .compile();

    app = module.createNestApplication();
    await app.init();

    return module;
  };

  afterEach(async () => {
    await app?.close();
  });

  describe('forRootAsync', () => {
    it('should be defined', async () => {
      const module = await createApp([
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        RedisModule,
      ]);

      expect(app).toBeDefined();
      expect(module.get(RedisService)).toBeDefined();
    });
  });

  describe('register', () => {
    it('should be defined with auth', async () => {
      const module = await createApp([
        RedisModule.register({
          name: 'test-redis-module',
          username: encodeURIComponent('default'),
          password: encodeURIComponent('123456'),
          host: 'localhost',
          port: 6379,
        }),
      ]);

      expect(app).toBeDefined();
      expect(module.get(RedisService)).toBeDefined();
    });

    it('should be defined without auth', async () => {
      const module = await createApp([
        RedisModule.register({
          host: 'localhost',
          port: 6380,
          database: 1,
        }),
      ]);

      expect(app).toBeDefined();
      expect(module.get(RedisService)).toBeDefined();
    });
  });

  it('should close the redis client on module destroy', async () => {
    await createApp([
      RedisModule.register({
        host: 'localhost',
        port: 6379,
      }),
    ]);

    await app.close();

    expect(redisClient.quit).toHaveBeenCalledTimes(1);
    app = undefined;
  });
});
