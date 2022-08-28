import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { tcName, TCRedisOptions, testContainers } from '@tresdoce-nestjs-toolkit/test-utils';

import { RedisModule } from '../redis/redis.module';
import { config } from './utils';

jest.setTimeout(70000);
describe('RedisModule - with auth', () => {
  let app: INestApplication;
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('redis:6.2-alpine', {
      ...TCRedisOptions,
      command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456'],
      containerName: `${tcName}-redis-module-with-auth`,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  describe('forRootAsync', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [config],
          }),
          RedisModule,
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

  describe('register', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          RedisModule.register({
            name: 'test-redis-module',
            username: encodeURIComponent('default'),
            password: encodeURIComponent('123456'),
            host: global.hostContainer,
            port: parseInt('6379', 10),
          }),
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
});

describe('RedisModule - without auth', () => {
  let app: INestApplication;
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('redis:6.2-alpine', {
      ...TCRedisOptions,
      containerName: `${tcName}-redis-module-without-auth`,
      envs: {},
      ports: [
        {
          container: 6379,
          host: 6380,
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
        RedisModule.register({
          host: global.hostContainer,
          port: parseInt('6380', 10),
          database: 1,
        }),
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
