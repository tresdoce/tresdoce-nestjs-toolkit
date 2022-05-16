import {
  appConfigBase,
  manifest,
  TCRedisOptions,
  TCMongoOptions,
  TCMySqlOptions,
  TCPostgresOptions,
} from '../fixtures';

describe('Fixture - appConfigBase', () => {
  it('should be return appBaseConfig', async () => {
    expect(appConfigBase).toBeDefined();
    expect(appConfigBase).not.toBe(null);
    expect(typeof appConfigBase).toBe('object');
  });
});

describe('Fixture - manifest', () => {
  it('should be return appBaseConfig', async () => {
    expect(manifest).toBeDefined();
    expect(manifest).not.toBe(null);
    expect(typeof manifest).toBe('object');
  });
});

describe('Fixture - TestContainers options', () => {
  it('should be define redis options', async () => {
    expect(TCRedisOptions).toBeDefined();
    expect(TCRedisOptions).not.toBe(null);
    expect(typeof TCRedisOptions).toBe('object');
    expect(TCRedisOptions.containerName).toEqual('tresdoce-test-container-redis');
    expect(TCRedisOptions.ports).toEqual({
      container: 6379,
      host: 6379,
    });
  });

  it('should be define mongo options', async () => {
    expect(TCMongoOptions).toBeDefined();
    expect(TCMongoOptions).not.toBe(null);
    expect(typeof TCMongoOptions).toBe('object');
    expect(TCMongoOptions.containerName).toEqual('tresdoce-test-container-mongo');
    expect(TCMongoOptions.ports).toEqual({
      container: 27017,
      host: 27017,
    });
  });

  it('should be define mysql options', async () => {
    expect(TCMySqlOptions).toBeDefined();
    expect(TCMySqlOptions).not.toBe(null);
    expect(typeof TCMySqlOptions).toBe('object');
    expect(TCMySqlOptions.containerName).toEqual('tresdoce-test-container-mysql');
    expect(TCMySqlOptions.ports).toEqual({
      container: 3306,
      host: 3306,
    });
  });

  it('should be define postgres options', async () => {
    expect(TCPostgresOptions).toBeDefined();
    expect(TCPostgresOptions).not.toBe(null);
    expect(typeof TCPostgresOptions).toBe('object');
    expect(TCPostgresOptions.containerName).toEqual('tresdoce-test-container-postgres');
    expect(TCPostgresOptions.ports).toEqual({
      container: 5432,
      host: 5432,
    });
  });
});
