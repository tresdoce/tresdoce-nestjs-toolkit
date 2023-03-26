import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  TCMongoOptions,
  TCMySqlOptions,
  TCPostgresOptions,
  tcName,
  testContainers,
  fixturePostResponse,
  fixtureUserArrayResponse,
} from '@tresdoce-nestjs-toolkit/test-utils';
import { Repository } from 'typeorm';

import { TypeOrmClientModule } from '../typeorm/typeorm.module';
import { Post } from './utils/post.entity';
import { User } from './utils/user.entity';

import { configPostgres, configMySql, configMongo } from './utils';

jest.setTimeout(70000);
describe('TypeOrm - Postgres', () => {
  let app: INestApplication;
  let container: testContainers;
  let repository: Repository<Post>;

  beforeAll(async () => {
    container = await new testContainers('postgres:13', {
      ...TCPostgresOptions,
      containerName: `${tcName}-typeorm-postgres`,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
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
    repository = module.get('PostRepository');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);

  it('should be return an array of post', async () => {
    await repository.save([fixturePostResponse]);

    const query = await repository.find();
    expect(query).toEqual([fixturePostResponse]);
  });
});

describe('TypeOrm - MySql', () => {
  let app: INestApplication;
  let container: testContainers;
  let repository: Repository<Post>;

  beforeAll(async () => {
    container = await new testContainers('mysql:5.7', {
      ...TCMySqlOptions,
      containerName: `${tcName}-typeorm-mysql`,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
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
    repository = module.get('PostRepository');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);

  it('should be return an array of post', async () => {
    await repository.save([fixturePostResponse]);

    const query = await repository.find();
    expect(query).toEqual([fixturePostResponse]);
  });
});

describe('TypeOrm - Mongo', () => {
  let app: INestApplication;
  let container: testContainers;
  let repository: Repository<User>;

  beforeAll(async () => {
    container = await new testContainers('mongo:5.0', {
      ...TCMongoOptions,
      containerName: `${tcName}-typeorm-mongo`,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
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
    repository = module.get('UserRepository');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    console.log(app);
    await expect(app).toBeDefined();
  }, 50000);

  it('should be return an array of user', async () => {
    await repository.save(fixtureUserArrayResponse);

    const query = await repository.find();
    expect(query).toEqual(expect.any(Array));
  });
});
