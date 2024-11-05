import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import { RateLimitModule } from '..';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

// Implementación de un servicio de configuración de rate limit que devuelve ThrottlerModuleOptions
class RateLimitConfigService {
  createOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          limit: 10,
          ttl: 60,
          blockDuration: 30,
        },
      ],
      ignoreUserAgents: [/googlebot/],
      errorMessage: 'Too many requests. Please try again later.',
    };
  }
}

describe('RateLimitModule', (): void => {
  let app: INestApplication;

  describe('Global', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          RateLimitModule
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });

  describe('Register', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.register({
            throttlers: [
              {
                limit: 10,
                ttl: 60,
              },
            ],
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

  });

  describe('RegisterAsync', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          RateLimitModule.registerAsync({
            useFactory: async (configService: ConfigService) => configService.get<ThrottlerModuleOptions>('config.server.rateLimits'),
            inject: [ConfigService],
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });

  describe('RegisterAsync without inject', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.registerAsync({
            useFactory: () => ([{
              ttl: 60,
              limit: 10,
            }]),
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

  });

  describe('RegisterAsync with useClass', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.registerAsync({
            useClass: RateLimitConfigService,
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

  });

  describe('RegisterAsync with useExisting', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        providers: [
          RateLimitConfigService,
        ],
        imports: [
          RateLimitModule.registerAsync({
            useExisting: RateLimitConfigService,
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });
  });

  describe('ForRoot', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.forRoot([{
            ttl: 60,
            limit: 10,
          }]),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

  });

  describe('ForRootAsync', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          RateLimitModule.forRootAsync({
            useFactory: async (configService: ConfigService) => configService.get<ThrottlerModuleOptions>('config.server.rateLimits'),
            inject: [ConfigService],
          }),
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
