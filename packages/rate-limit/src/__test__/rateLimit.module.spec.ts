import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { RateLimitModule } from '..';

describe('RateLimitModule', (): void => {
  let app: INestApplication;

  describe('Global', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                server: {
                  rateLimits: {
                    throttlers: [
                      {
                        name: 'short',
                        ttl: 1000,
                        limit: 3,
                        blockDuration: 30,
                      },
                      {
                        name: 'medium',
                        ttl: 10000,
                        limit: 20,
                        scope: [
                          { endpoint: 'cats', ttl: 60, limit: 5 },
                          { endpoint: 'dogs', ttl: 60, limit: 10 },
                        ],
                      },
                      {
                        name: 'long',
                        ttl: 60000,
                        limit: 100,
                      },
                    ],
                    ignoreUserAgents: [/googlebot/],
                    errorMessage: 'Too many requests. Please try again later.',
                  },
                },
              }),
            ],
          }),
          RateLimitModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });
});
