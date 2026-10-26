import { Test, TestingModule } from '@nestjs/testing';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, registerAs } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import request from 'supertest';

import {
  RATE_LIMIT_MODULE_OPTIONS,
  RateLimitModule,
  SkipThrottle,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
} from '../index.js';

@Controller('test')
class TestController {
  @Get()
  getTest() {
    return { ok: true };
  }

  @SkipThrottle({ short: true, long: true })
  @Get('skip')
  getSkip() {
    return { ok: true };
  }
}

const rateLimits: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      ttl: 1000,
      limit: 3,
      blockDuration: 30000,
    },
    {
      name: 'long',
      ttl: 60000,
      limit: 100,
    },
  ],
  ignoreUserAgents: [/googlebot/],
  errorMessage: 'Too many requests. Please try again later.',
};

describe('RateLimitModule', (): void => {
  let app: INestApplication;

  afterEach(async () => {
    await app?.close();
  });

  describe('with config.server.rateLimits', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [dynamicConfig({ server: { rateLimits } })],
          }),
          RateLimitModule,
        ],
        controllers: [TestController],
        providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should expose the resolved options through RATE_LIMIT_MODULE_OPTIONS', () => {
      const options = app.get<ThrottlerModuleOptions>(RATE_LIMIT_MODULE_OPTIONS);
      expect(options).toEqual(expect.objectContaining({ errorMessage: rateLimits.errorMessage }));
      expect((options as { throttlers: unknown[] }).throttlers).toHaveLength(2);
    });

    it('should set rate limit headers and return 429 when the limit is exceeded', async () => {
      const server = app.getHttpServer();

      for (let i = 1; i <= 3; i++) {
        const res = await request(server).get('/test').expect(200);
        expect(res.headers['x-ratelimit-limit-short']).toBe('3');
        expect(res.headers['x-ratelimit-remaining-short']).toBe(String(3 - i));
        expect(res.headers['x-ratelimit-reset-short']).toBeDefined();
        expect(res.headers['x-ratelimit-limit-long']).toBe('100');
      }

      const blocked = await request(server).get('/test').expect(429);
      expect(blocked.body).toEqual({
        statusCode: 429,
        message: 'Too many requests. Please try again later.',
      });
      expect(blocked.headers['retry-after-short']).toBe('30');
    });

    it('should ignore configured user agents', async () => {
      const server = app.getHttpServer();
      for (let i = 0; i < 5; i++) {
        const res = await request(server).get('/test').set('User-Agent', 'googlebot').expect(200);
        expect(res.headers['x-ratelimit-limit-short']).toBeUndefined();
      }
    });

    it('should skip named throttlers with @SkipThrottle({ <name>: true })', async () => {
      const server = app.getHttpServer();
      for (let i = 0; i < 5; i++) {
        const res = await request(server).get('/test/skip').expect(200);
        expect(res.headers['x-ratelimit-limit-short']).toBeUndefined();
      }
    });
  });

  describe('without config.server.rateLimits', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [registerAs('config', () => ({ server: {} }))],
          }),
          RateLimitModule,
        ],
        controllers: [TestController],
        providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
      }).compile();

      app = moduleFixture.createNestApplication({ logger: false });
      await app.init();
    });

    it('should fallback to an empty throttlers list and not limit requests', async () => {
      expect(app.get(RATE_LIMIT_MODULE_OPTIONS)).toEqual({ throttlers: [] });
      const server = app.getHttpServer();
      for (let i = 0; i < 5; i++) {
        const res = await request(server).get('/test').expect(200);
        expect(res.headers['x-ratelimit-limit']).toBeUndefined();
      }
    });
  });
});
