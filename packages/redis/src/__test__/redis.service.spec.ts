import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { delay, tcName, TCRedisOptions, testContainers } from '@tresdoce-nestjs-toolkit/test-utils';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/services/redis.service';

describe('RedisService', () => {
  let app: INestApplication;
  let container: testContainers;
  let service: RedisService;

  beforeAll(async () => {
    container = await new testContainers('redis:6.2-alpine', {
      ...TCRedisOptions,
      command: ['redis-server', '--appendonly', 'yes', '--requirepass', '123456'],
      containerName: `${tcName}-redis-service`,
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
          name: 'test-redis-module',
          username: encodeURIComponent('default'),
          password: encodeURIComponent('123456'),
          host: global.hostContainer,
          port: parseInt('6379', 10),
        }),
      ],
      providers: [RedisService],
    }).compile();

    app = module.createNestApplication();
    service = module.get(RedisService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);

  it('should be return echo', async () => {
    const msg = 'hello world';
    expect(await service.echo(msg)).toEqual(msg);
  });

  it('should be return false if key dont exist in redis', async () => {
    expect(await service.exists('myKey')).toBeFalsy();
  });

  it('should be return OK when set value in redis', async () => {
    expect(await service.set('myKey', 'hello world')).toEqual('OK');
  });

  it('should be return value of key', async () => {
    expect(await service.get('myKey')).toEqual('hello world');
  });

  it('should be return true if key exist in redis', async () => {
    expect(await service.exists('myKey')).toBeTruthy();
  });

  it('should be set value in redis with expiration date', async () => {
    expect(await service.set('myKeyEx', 'hello world', 2)).toEqual('OK');
    expect(await service.exists('myKeyEx')).toBeTruthy();
    await delay(3000);
    expect(await service.exists('myKeyEx')).toBeFalsy();
  });

  it('should be return true when copy key', async () => {
    expect(await service.copy('myKey', 'copyKey')).toBeTruthy();
  });

  it('should be return false when copy key', async () => {
    expect(await service.copy('myKey2', 'copyKey')).toBeFalsy();
  });

  it('should be rename a key', async () => {
    expect(await service.rename('copyKey', 'newKey')).toEqual('OK');
  });

  it('should be return false when delete a key', async () => {
    expect(await service.del('testKey')).toBeFalsy();
  });

  it('should be return true when delete a key', async () => {
    expect(await service.del('newKey')).toBeTruthy();
  });

  it('should be flush all', async () => {
    expect(await service.flushAll()).toEqual('OK');
    expect(await service.get('myKey')).toBeNull();
  });
});
