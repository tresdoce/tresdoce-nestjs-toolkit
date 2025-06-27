import { INestApplication, Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import * as dynamoose from 'dynamoose';

import { DynamooseModule } from '../dynamoose/dynamoose.module';
import { DynamooseModuleOptions, DynamooseOptionsFactory } from '../dynamoose/interfaces';

import { DYNAMOOSE_OPTIONS } from '../dynamoose/constants/dynamoose.constant';
import { UserSchema } from './utils/user.schema';

// 🧪 Config de entorno
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

// ✅ Factory class para useClass y useExisting
@Injectable()
class TestOptionsFactory implements DynamooseOptionsFactory {
  createDynamooseOptions(): DynamooseModuleOptions {
    return {
      local: true,
      logger: false,
      ddb: new dynamoose.aws.ddb.DynamoDB({
        region: `${process.env.AWS_REGION}`,
      }),
    };
  }
}

// ✅ Módulo auxiliar para exportar el factory
@Module({
  providers: [TestOptionsFactory],
  exports: [TestOptionsFactory],
})
class TestOptionsFactoryModule {}

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

  describe('DynamooseModule - forRootAsync with useFactory', () => {
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

  describe('DynamooseModule - forRootAsync with useClass', () => {
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
            useClass: TestOptionsFactory,
          }),
        ],
        providers: [TestOptionsFactory],
      }).compile();

      app = module.createNestApplication();
      await app.init();
    });

    afterEach(async () => {
      await app.close();
    });

    it('should be defined with useClass config', () => {
      expect(app).toBeDefined();
    });
  });
});
