import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { configPostgres, configMySql, configMongo } from './utils';
import {
  initPostgresDBContainer,
  initMySqlDBContainer,
  initMongoDBContainer,
  stopContainer,
} from './utils/setupDBContainers';

import { TypeOrmClientModule } from '../typeorm/typeorm.module';
import { Post } from './utils/post.entity';
import { User } from './utils/user.entity';

jest.setTimeout(70000);
describe('TypeOrm - Postgres', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await initPostgresDBContainer();
  });

  afterAll(async () => {
    await stopContainer();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configPostgres],
        }),
        TypeOrmClientModule,
        TypeOrmClientModule.forFeature([Post]),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);
});

describe('TypeOrm - MySql', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await initMySqlDBContainer();
  });

  afterAll(async () => {
    await stopContainer();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configMySql],
        }),
        TypeOrmClientModule,
        TypeOrmClientModule.forFeature([Post]),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);
});

describe('TypeOrm - Mongo', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await initMongoDBContainer();
  });

  afterAll(async () => {
    await stopContainer();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configMongo],
        }),
        TypeOrmClientModule,
        TypeOrmClientModule.forFeature([User]),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);
});
