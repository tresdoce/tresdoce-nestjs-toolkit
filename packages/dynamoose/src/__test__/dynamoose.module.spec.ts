import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import * as dynamoose from 'dynamoose';

import { DynamooseModule } from '../dynamoose/dynamoose.module';
import {
  createDynamooseAsyncProviders,
  createDynamooseProviders,
} from '../dynamoose/providers/dynamoose.provider';
import process from 'process';
import { DynamooseModuleOptions, ModelDefinition } from '../dynamoose/interfaces';
import { UserSchema } from './utils/user.schema';

process.env.AWS_ACCESS_KEY_ID = 'local';
process.env.AWS_SECRET_ACCESS_KEY = 'local';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_DYNAMO_URL = 'http://localhost:8000';

const dynamooseOptions: DynamooseModuleOptions = {
  local: true,
  aws: {
    accessKeyId: `${process.env.AWS_ACCESS_KEY_ID}`,
    secretAccessKey: `${process.env.AWS_SECRET_ACCESS_KEY}`,
    region: `${process.env.AWS_REGION}`,
  },
  table: {
    create: true,
    prefix: `module-dynamoose-test-`,
    suffix: '-table',
  },
  logger: false,
};

describe('DynamooseModule', () => {
  let app: INestApplication;

  describe('Basic configuration', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                dynamodb: dynamooseOptions,
              }),
            ],
          }),
          DynamooseModule,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    describe('forRoot', () => {
      it('should return a dynamic module', () => {
        const dynamicModule = DynamooseModule.forRoot();
        expect(dynamicModule).toBeDefined();
      });

      it('should create a module with forRoot method', async () => {
        const rootModule = DynamooseModule.forRoot(dynamooseOptions);
        expect(rootModule).toBeDefined();
      });
    });

    describe('forRootAsync', () => {
      it('should return a dynamic module', () => {
        const asyncModule = DynamooseModule.forRootAsync({ useFactory: async () => ({}) });
        expect(asyncModule).toBeDefined();
      });

      it('should create a module with forRootAsync method', async () => {
        const asyncOptions = {
          useFactory: async (configService: ConfigService): Promise<DynamooseModuleOptions> =>
            configService.get<DynamooseModuleOptions>('config.dynamodb'),
          inject: [ConfigService],
        };
        const asyncRootModule = DynamooseModule.forRootAsync(asyncOptions);
        expect(asyncRootModule).toBeDefined();
      });
    });

    describe('forFeature', () => {
      it('should return a dynamic module empty', () => {
        const featureModule = DynamooseModule.forFeature();
        expect(featureModule).toBeDefined();
      });

      it('should return a dynamic module', () => {
        const featureModule = DynamooseModule.forFeature([]);
        expect(featureModule).toBeDefined();
      });

      it('should provide and export dynamoose providers', () => {
        const featureModule = DynamooseModule.forFeature([]);
        const providers = createDynamooseProviders([]);
        expect(featureModule.providers).toEqual(providers);
        expect(featureModule.exports).toEqual(providers);
      });

      it('should create a module with forFeature method', async () => {
        const models: ModelDefinition[] = [
          {
            name: 'User',
            schema: UserSchema,
            options: {
              tableName: 'user',
            },
            serializers: {
              frontend: { exclude: ['status'] },
              backend: { exclude: ['status'] },
            },
          },
        ];
        const featureModule = DynamooseModule.forFeature(models);
        expect(featureModule).toBeDefined();
      });
    });

    describe('forFeatureAsync', () => {
      it('should return a dynamic module empty', () => {
        const asyncFeatureModule = DynamooseModule.forFeatureAsync();
        expect(asyncFeatureModule).toBeDefined();
      });

      it('should return a dynamic module', () => {
        const asyncFeatureModule = DynamooseModule.forFeatureAsync([]);
        expect(asyncFeatureModule).toBeDefined();
      });

      it('should provide and export dynamoose async providers', () => {
        const asyncFeatureModule = DynamooseModule.forFeatureAsync([]);
        const providers = createDynamooseAsyncProviders([]);
        expect(asyncFeatureModule.providers).toEqual(providers);
        expect(asyncFeatureModule.exports).toEqual(providers);
      });

      it('should create a module with forFeatureAsync method', async () => {
        const factories = [
          {
            name: 'User',
            useFactory: async () => ({
              schema: UserSchema,
              options: {
                tableName: 'user',
              },
              serializers: {
                frontend: { exclude: ['status'] },
              },
            }),
            inject: [],
          },
        ];
        const featureAsyncModule = DynamooseModule.forFeatureAsync(factories);
        expect(featureAsyncModule).toBeDefined();
      });
    });

    describe('providers', () => {
      it('should create dynamoose providers', async () => {
        const models: ModelDefinition[] = [
          {
            name: 'User',
            schema: UserSchema,
            options: {
              tableName: 'user',
            },
          },
          {
            name: 'TestModel',
            schema: {
              id: String,
            },
            options: {
              tableName: 'test',
            },
          },
        ];
        const providers = createDynamooseProviders(models);
        expect(providers).toBeDefined();
      });

      it('should create async dynamoose providers', async () => {
        const factories: any[] = [
          {
            name: 'User',
            useFactory: async () => ({
              schema: UserSchema,
              options: {
                tableName: 'user',
              },
              serializers: {},
            }),
            inject: [],
          },
          {
            name: 'TestModel',
            useFactory: async () => ({
              schema: {
                id: String,
              },
              options: { timestamps: true },
              serializers: {
                serializerName: {
                  input: jest.fn(),
                  output: jest.fn(),
                },
              },
            }),
            inject: [],
          },
        ];
        const providers = createDynamooseAsyncProviders(factories);
        expect(providers).toBeDefined();
      });
    });
  });

  describe('Advance configuration', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              dynamicConfig({
                dynamodb: {
                  logger: true,
                  local: `${process.env.AWS_DYNAMO_URL}`,
                  ddb: new dynamoose.aws.ddb.DynamoDB({
                    region: `${process.env.AWS_REGION}`,
                  }),
                },
              }),
            ],
          }),
          DynamooseModule,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('should be defined', async () => {
      expect(app).toBeDefined();
    });
  });
});
