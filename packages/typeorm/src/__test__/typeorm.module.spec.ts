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
describe('TypeOrm', () => {
  describe('Postgres', () => {
    let app: INestApplication;
    let repository: Repository<Post>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
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
      expect(app).toBeDefined();
    }, 50000);

    it('should be return an array of post', async () => {
      await repository.save([fixturePostResponse]);

      const query = await repository.find();
      expect(query).toEqual([fixturePostResponse]);
    });
  });

  describe('MySql', () => {
    let app: INestApplication;
    let repository: Repository<Post>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
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
      expect(app).toBeDefined();
    }, 50000);

    it('should be return an array of post', async () => {
      await repository.save([fixturePostResponse]);

      const query = await repository.find();
      expect(query).toEqual([fixturePostResponse]);
    });
  });

  describe('Mongo', () => {
    let app: INestApplication;
    let repository: Repository<User>;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          await ConfigModule.forRoot({
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
      expect(app).toBeDefined();
    }, 50000);

    it('should be return an array of user', async () => {
      await repository.save(fixtureUserArrayResponse);

      const query: User[] = await repository.find();
      expect(query).toEqual(expect.any(Array));
    });
  });
});
