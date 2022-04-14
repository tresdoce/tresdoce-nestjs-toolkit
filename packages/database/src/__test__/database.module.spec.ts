import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { MongoModule } from '../lib/mongo.module';
import { User, UserSchema } from './utils/user.entity';

import { config } from './utils';
import { initContainerDB, stopDbContainer } from './utils/setupMongoContainer';

jest.setTimeout(70000);

describe('DatabaseModule - without username and password', () => {
  let app: INestApplication;

  const mockMongoToken = {
    provide: getModelToken(User.name),
    useValue: {
      find: jest.fn(() => [
        {
          firstname: 'juan',
          lastname: 'perez',
        },
      ]),
    },
  };

  beforeAll(async () => {
    await initContainerDB();
  });

  afterAll(async () => {
    await stopDbContainer();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
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
