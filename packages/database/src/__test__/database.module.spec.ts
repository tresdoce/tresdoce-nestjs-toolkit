import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import {
  TCMongoOptions,
  tcName,
  testContainers,
  dynamicConfig,
  tcUsername,
  tcPassword,
  tcDatabaseName,
} from '@tresdoce-nestjs-toolkit/test-utils';

import { MongoModule } from '../mongo/mongo.module.js';
import { User, UserSchema } from './utils/user.entity.js';

vi.setConfig({ testTimeout: 70000 });
describe('DatabaseModule - whit username and password', () => {
  let app: INestApplication;
  let container: testContainers;

  const mockMongoToken = {
    provide: getModelToken(User.name),
    useValue: {
      find: vi.fn(() => [
        {
          firstname: 'juan',
          lastname: 'perez',
        },
      ]),
    },
  };

  beforeAll(async () => {
    container = new testContainers('mongo:8.0.13', {
      ...TCMongoOptions,
      containerName: `${tcName}-database-mongo-with-auth`,
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
          load: [
            dynamicConfig({
              database: {
                mongo: {
                  connection: 'mongodb',
                  host: global.hostContainer,
                  port: parseInt('27017', 10),
                  username: encodeURIComponent(tcUsername),
                  password: encodeURIComponent(tcPassword),
                  database: encodeURIComponent(tcDatabaseName),
                  authSource: encodeURIComponent('admin'),
                },
              },
            }),
          ],
        }),
        MongoModule,
        MongoModule.forFeature([
          {
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [mockMongoToken],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  }, 50000);
});

describe('DatabaseModule - without username and password', () => {
  let app: INestApplication;
  let container: testContainers;

  const mockMongoToken = {
    provide: getModelToken(User.name),
    useValue: {
      find: vi.fn(() => [
        {
          firstname: 'juan',
          lastname: 'perez',
        },
      ]),
    },
  };

  beforeAll(async () => {
    container = new testContainers('mongo:8.0.13', {
      ...TCMongoOptions,
      envs: {},
      containerName: `${tcName}-database-mongo-without-auth`,
      ports: [
        {
          container: 27017,
          host: 27018,
        },
      ],
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
          load: [
            dynamicConfig({
              database: {
                mongo: {
                  connection: 'mongodb',
                  host: global.hostContainer,
                  port: parseInt('27018', 10),
                },
              },
            }),
          ],
        }),
        MongoModule,
        MongoModule.forFeature([
          {
            name: User.name,
            schema: UserSchema,
          },
        ]),
      ],
      providers: [mockMongoToken],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  }, 50000);
});
