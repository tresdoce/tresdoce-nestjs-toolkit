import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import { AwsSqsModule, AwsSqsModuleOptions, AwsSqsModuleOptionsFactory, AwsSqsService } from '..';

class AwsSqsConfigService implements AwsSqsModuleOptionsFactory {
  createOptions(): AwsSqsModuleOptions {
    const { project } = config();
    return { apiPrefix: project.apiPrefix, apiName: project.name };
  }
}

describe('AwsSqsModule', (): void => {
  let app: INestApplication;
  let awsSqsService: AwsSqsService;

  describe('Global', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          AwsSqsModule,
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should be initialize global module', async () => {
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
    });
  });

  describe('Register', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          AwsSqsModule.register({
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
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
          AwsSqsModule.registerAsync({
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
    });
  });

  describe('RegisterAsync without inject', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          AwsSqsModule.registerAsync({
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
    });
  });

  describe('RegisterAsync with useClass', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          AwsSqsModule.registerAsync({
            useClass: AwsSqsConfigService,
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
    });
  });

  describe('RegisterAsync with useExisting', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          AwsSqsModule.registerAsync({
            extraProviders: [AwsSqsConfigService],
            useExisting: AwsSqsConfigService,
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
    });
  });

  describe('ForRoot', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          AwsSqsModule.forRoot({
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
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
          AwsSqsModule.forRootAsync({
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
      awsSqsService = app.get<AwsSqsService>(AwsSqsService);
      expect(awsSqsService).toBeDefined();
    });
  });
});
