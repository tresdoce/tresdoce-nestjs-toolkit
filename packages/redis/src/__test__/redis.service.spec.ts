import { REDIS_CLIENT } from '../redis/constants/redis.constants';
import { RedisService } from '../redis/services/redis.service';

describe('RedisService', () => {
  let client: Record<string, jest.Mock>;
  let service: RedisService;

  beforeEach(() => {
    client = {
      copy: jest.fn(),
      del: jest.fn(),
      echo: jest.fn(),
      exists: jest.fn(),
      flushAll: jest.fn(),
      get: jest.fn(),
      rename: jest.fn(),
      set: jest.fn(),
      setEx: jest.fn(),
    };

    service = new RedisService(client as any);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(REDIS_CLIENT).toBeDefined();
  });

  it('should be return echo', async () => {
    const msg = 'hello world';
    client.echo.mockResolvedValue(msg);

    expect(await service.echo(msg)).toEqual(msg);
    expect(client.echo).toHaveBeenCalledWith(msg);
  });

  it('should be return false if key dont exist in redis', async () => {
    client.exists.mockResolvedValue(0);

    expect(await service.exists('myKey')).toBeFalsy();
  });

  it('should be return OK when set value in redis', async () => {
    client.set.mockResolvedValue('OK');

    expect(await service.set('myKey', 'hello world')).toEqual('OK');
    expect(client.set).toHaveBeenCalledWith('myKey', JSON.stringify('hello world'));
  });

  it('should be return value of key', async () => {
    client.get.mockResolvedValue(JSON.stringify('hello world'));

    expect(await service.get('myKey')).toEqual('hello world');
  });

  it('should be return null if key has no value', async () => {
    client.get.mockResolvedValue(null);

    expect(await service.get('myKey')).toBeNull();
  });

  it('should be return true if key exist in redis', async () => {
    client.exists.mockResolvedValue(1);

    expect(await service.exists('myKey')).toBeTruthy();
  });

  it('should be set value in redis with expiration date', async () => {
    client.setEx.mockResolvedValue('OK');

    expect(await service.set('myKeyEx', 'hello world', 2)).toEqual('OK');
    expect(client.setEx).toHaveBeenCalledWith('myKeyEx', 2, JSON.stringify('hello world'));
  });

  it('should be return true when copy key', async () => {
    client.copy.mockResolvedValue(1);

    expect(await service.copy('myKey', 'copyKey')).toBeTruthy();
  });

  it('should be return false when copy key', async () => {
    client.copy.mockResolvedValue(0);

    expect(await service.copy('myKey2', 'copyKey')).toBeFalsy();
  });

  it('should be rename a key', async () => {
    client.rename.mockResolvedValue('OK');

    expect(await service.rename('copyKey', 'newKey')).toEqual('OK');
  });

  it('should be return false when delete a key', async () => {
    client.del.mockResolvedValue(0);

    expect(await service.del('testKey')).toBeFalsy();
  });

  it('should be return true when delete a key', async () => {
    client.del.mockResolvedValue(1);

    expect(await service.del('newKey')).toBeTruthy();
  });

  it('should be flush all', async () => {
    client.flushAll.mockResolvedValue('OK');

    expect(await service.flushAll()).toEqual('OK');
  });
});
