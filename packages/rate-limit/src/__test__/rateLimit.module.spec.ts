import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import {
  RateLimitModule,
  RateLimitModuleOptions,
  RateLimitModuleOptionsFactory,
  RateLimitService,
} from '..';

class RateLimitConfigService implements RateLimitModuleOptionsFactory {
  createOptions(): RateLimitModuleOptions {
    const { project } = config();
    return { apiPrefix: project.apiPrefix, apiName: project.name };
  }
}

describe('RateLimitModule', (): void => {
  let app: INestApplication;
  let rateLimitService: RateLimitService;

  describe('Global', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
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

    it('should be initialize global module', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });

  describe('Register', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.register({
            apiPrefix: 'API-TEST',
            apiName: 'nestjs-starter-test',
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should initialize with register (sync)', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });

  describe('RegisterAsync', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          RateLimitModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
              apiPrefix: configService.get<string>('config.project.apiPrefix'),
              apiName: configService.get<string>('config.project.name'),
            }),
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

    it('should initialize with registerAsync', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });

  describe('RegisterAsync without inject', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.registerAsync({
            useFactory: () => ({
              apiPrefix: config().project.apiPrefix,
              apiName: config().project.name,
            }),
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should initialize with registerAsync', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
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

    it('should initialize with registerAsync with useClass', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });

  describe('RegisterAsync with useExisting', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.registerAsync({
            extraProviders: [RateLimitConfigService],
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

    it('should initialize with registerAsync with useExisting', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });

  describe('ForRoot', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          RateLimitModule.forRoot({
            apiPrefix: 'API-TEST',
            apiName: 'nestjs-starter-test',
          }),
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should initialize with forRoot (sync)', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });

  describe('ForRootAsync', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          RateLimitModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
              apiPrefix: configService.get<string>('config.project.apiPrefix'),
              apiName: configService.get<string>('config.project.name'),
            }),
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

    it('should initialize with forRootAsync', async () => {
      rateLimitService = app.get<RateLimitService>(RateLimitService);
      expect(rateLimitService).toBeDefined();
    });
  });
});
