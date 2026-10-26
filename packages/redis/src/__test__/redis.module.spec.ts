import type { Mock } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { REDIS_CLIENT } from '../redis/constants/redis.constants.js';
import { RedisModule } from '../redis/redis.module.js';
import { RedisService } from '../redis/services/redis.service.js';
import { config } from './utils/index.js';

describe('RedisModule', () => {
  let app: INestApplication;
  let redisClient: { close: Mock; isOpen: boolean };

  const createApp = async (imports: any[], isOpen = true) => {
    redisClient = {
      close: vi.fn().mockResolvedValue(undefined),
      isOpen,
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

    expect(redisClient.close).toHaveBeenCalledTimes(1);
    app = undefined;
  });

  it('should not close the redis client if it is already closed', async () => {
    await createApp([RedisModule.register({ host: 'localhost', port: 6379 })], false);

    await app.close();

    expect(redisClient.close).not.toHaveBeenCalled();
    app = undefined;
  });

  it('should fall back to quit when the client has no close method', async () => {
    const legacyClient = { quit: vi.fn().mockResolvedValue('OK') };
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule.register({ host: 'localhost', port: 6379 })],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue(legacyClient)
      .compile();

    app = module.createNestApplication();
    await app.init();
    await app.close();

    expect(legacyClient.quit).toHaveBeenCalledTimes(1);
    app = undefined;
  });

  it('should not fail on destroy when the client is not available', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule.register({ host: 'localhost', port: 6379 })],
    })
      .overrideProvider(REDIS_CLIENT)
      .useValue(null)
      .compile();

    app = module.createNestApplication();
    await app.init();

    await expect(app.close()).resolves.toBeUndefined();
    app = undefined;
  });
});
