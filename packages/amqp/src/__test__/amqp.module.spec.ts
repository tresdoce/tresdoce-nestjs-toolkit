import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AMQPModule } from '../lib/amqp.module';
const mockedConfig = {
  config: {
    server: {
      isProd: false,
    },
    artemisConfig: {
      protocol: 'amqp',
      username: 'default',
      password: 'admin',
      url: 'localhost',
      port: 5672,
    },
  },
};

describe('AMQPModule for root', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AMQPModule.forRoot({
          protocol: 'amqp',
          name: 'default',
          username: 'admin',
          password: 'admin',
          port: 5672,
          url: 'localhost',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  });
});

describe('AMQPModule for root Async', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedConfig)],
        }),
        AMQPModule.forRootAsync({ name: 'demo' }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  });
});
