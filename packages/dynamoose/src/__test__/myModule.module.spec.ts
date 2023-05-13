import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import * as dynamoose from 'dynamoose';

import { DynamooseModule } from '../dynamoose/dynamoose.module';
import { DynamooseModuleOptions } from '../dynamoose/interfaces';

import { DYNAMOOSE_OPTIONS } from '../dynamoose/constants/dynamoose.constant';
import { UserSchema } from './utils/user.schema';

process.env.AWS_ACCESS_KEY_ID = 'local';
process.env.AWS_SECRET_ACCESS_KEY = 'local';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_DYNAMO_URL = 'http://localhost:8000';

const dynamooseOptions: DynamooseModuleOptions = {
  local: `${process.env.AWS_DYNAMO_URL}`,
  logger: true,
  ddb: new dynamoose.aws.ddb.DynamoDB({
    region: `${process.env.AWS_REGION}`,
  }),
};

describe('MyModule', () => {
  let app: INestApplication;

  describe('DynamooseModule - forRoot', () => {
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
          DynamooseModule.forRoot(),
          DynamooseModule.forFeature([
            {
              name: 'User',
              schema: UserSchema,
              options: {
                tableName: 'user',
              },
              serializers: {
                frontend: { exclude: ['status'] },
              },
            },
          ]),
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

  describe('DynamooseModule - forRootAsync', () => {
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
          DynamooseModule.forRootAsync({
            useFactory: async (options: DynamooseModuleOptions): Promise<DynamooseModuleOptions> =>
              options,
            inject: [DYNAMOOSE_OPTIONS],
          }),
        ],
        providers: [
          {
            provide: DYNAMOOSE_OPTIONS,
            useFactory: async (configService: ConfigService): Promise<DynamooseModuleOptions> =>
              configService.get<DynamooseModuleOptions>('config.dynamodb'),
            inject: [ConfigService],
          },
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
