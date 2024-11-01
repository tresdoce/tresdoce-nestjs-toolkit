import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import { SQSClient, CreateQueueCommand, ListQueuesCommand } from '@aws-sdk/client-sqs';

import { AwsSqsModule, AwsSqsModuleOptions, AwsSqsModuleOptionsFactory, AwsSqsService } from '..';

const endpoint: string = 'http://localhost:4566';
const queueNames: string[] = ['orders', 'notifications'];

class AwsSqsConfigService implements AwsSqsModuleOptionsFactory {
  createOptions(): AwsSqsModuleOptions {
    return {
      region: 'us-east-1',
      endpoint,
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      queues: queueNames.map((queueName) => ({
        name: queueName,
        url: `${endpoint}/000000000000/${queueName}`,
      })),
    };
  }
}

describe('AwsSqsModule', (): void => {
  let app: INestApplication;
  let awsSqsService: AwsSqsService;

  const sqsClient: SQSClient = new SQSClient({
    endpoint,
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });

  const createQueues = async (queueNames: string[]): Promise<void> => {
    const existingQueues = await sqsClient.send(new ListQueuesCommand({}));

    const existingQueueUrls: string[] = existingQueues.QueueUrls || [];

    for (const queueName of queueNames) {
      const queueExists: boolean = existingQueueUrls.some((url: string) => url.includes(queueName));

      if (!queueExists) {
        await sqsClient.send(new CreateQueueCommand({ QueueName: queueName }));
      }
    }
  };

  beforeAll(async (): Promise<void> => {
    await createQueues(queueNames);
  });

  describe('Global', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                sqs: {
                  region: 'us-east-1',
                  endpoint,
                  credentials: {
                    accessKeyId: 'test',
                    secretAccessKey: 'test',
                  },
                  queues: queueNames.map((queueName) => ({
                    name: queueName,
                    url: `${endpoint}/000000000000/${queueName}`,
                  })),
                },
              }),
            ],
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
            region: 'us-east-1',
            endpoint,
            credentials: {
              accessKeyId: 'test',
              secretAccessKey: 'test',
            },
            queues: queueNames.map((queueName) => ({
              name: queueName,
              url: `${endpoint}/000000000000/${queueName}`,
            })),
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
            load: [
              dynamicConfig({
                sqs: {
                  region: 'us-east-1',
                  endpoint,
                  credentials: {
                    accessKeyId: 'test',
                    secretAccessKey: 'test',
                  },
                  queues: queueNames.map((queueName) => ({
                    name: queueName,
                    url: `${endpoint}/000000000000/${queueName}`,
                  })),
                },
              }),
            ],
          }),
          AwsSqsModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
              region: configService.get<string>('config.sqs.region'),
              endpoint: configService.get<string>('config.sqs.endpoint'),
              credentials: {
                accessKeyId: configService.get<string>('config.sqs.credentials'),
                secretAccessKey: configService.get<string>(
                  'config.sqs.credentials.secretAccessKey',
                ),
              },
              queues: queueNames.map((queueName) => ({
                name: queueName,
                url: `${endpoint}/000000000000/${queueName}`,
              })),
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
              region: 'us-east-1',
              endpoint,
              credentials: {
                accessKeyId: 'test',
                secretAccessKey: 'test',
              },
              queues: queueNames.map((queueName) => ({
                name: queueName,
                url: `${endpoint}/000000000000/${queueName}`,
              })),
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
            region: 'us-east-1',
            endpoint,
            credentials: {
              accessKeyId: 'test',
              secretAccessKey: 'test',
            },
            queues: queueNames.map((queueName) => ({
              name: queueName,
              url: `${endpoint}/000000000000/${queueName}`,
            })),
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
            load: [
              dynamicConfig({
                sqs: {
                  region: 'us-east-1',
                  endpoint,
                  credentials: {
                    accessKeyId: 'test',
                    secretAccessKey: 'test',
                  },
                  queues: queueNames.map((queueName) => ({
                    name: queueName,
                    url: `${endpoint}/000000000000/${queueName}`,
                  })),
                },
              }),
            ],
          }),
          AwsSqsModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
              region: configService.get<string>('config.sqs.region'),
              endpoint: configService.get<string>('config.sqs.endpoint'),
              credentials: {
                accessKeyId: configService.get<string>('config.sqs.credentials'),
                secretAccessKey: configService.get<string>(
                  'config.sqs.credentials.secretAccessKey',
                ),
              },
              queues: queueNames.map((queueName) => ({
                name: queueName,
                url: `${endpoint}/000000000000/${queueName}`,
              })),
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
