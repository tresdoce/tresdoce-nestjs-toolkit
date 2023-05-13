import {
  appConfigBase,
  manifest,
  TCRedisOptions,
  TCMongoOptions,
  TCMySqlOptions,
  TCPostgresOptions,
  TCElasticSearchOptions,
  TCDynamoDBOptions,
} from '../fixtures';

const containerName_prefix = 'tresdoce-test-container';
describe('Fixtures', () => {
  describe('appConfigBase', () => {
    it('should be return appBaseConfig', async () => {
      expect(appConfigBase).toBeDefined();
      expect(appConfigBase).not.toBe(null);
      expect(typeof appConfigBase).toBe('object');
    });
  });

  describe('manifest', () => {
    it('should be return appBaseConfig', async () => {
      expect(manifest).toBeDefined();
      expect(manifest).not.toBe(null);
      expect(typeof manifest).toBe('object');
    });
  });

  describe('TestContainers options', () => {
    it('should be define Redis options', async () => {
      expect(TCRedisOptions).toBeDefined();
      expect(TCRedisOptions).not.toBe(null);
      expect(typeof TCRedisOptions).toBe('object');
      expect(TCRedisOptions.containerName).toEqual(`${containerName_prefix}-redis`);
      expect(TCRedisOptions.ports).toEqual([
        {
          container: 6379,
          host: 6379,
        },
      ]);
    });

    it('should be define DynamoDB options', async () => {
      expect(TCDynamoDBOptions).toBeDefined();
      expect(TCDynamoDBOptions).not.toBe(null);
      expect(typeof TCDynamoDBOptions).toBe('object');
      expect(TCDynamoDBOptions.containerName).toEqual(`${containerName_prefix}-dynamodb`);
      expect(TCDynamoDBOptions.ports).toEqual([
        {
          container: 8000,
          host: 8000,
        },
      ]);
    });

    it('should be define MongoDB options', async () => {
      expect(TCMongoOptions).toBeDefined();
      expect(TCMongoOptions).not.toBe(null);
      expect(typeof TCMongoOptions).toBe('object');
      expect(TCMongoOptions.containerName).toEqual(`${containerName_prefix}-mongo`);
      expect(TCMongoOptions.ports).toEqual([
        {
          container: 27017,
          host: 27017,
        },
      ]);
    });

    it('should be define MySql options', async () => {
      expect(TCMySqlOptions).toBeDefined();
      expect(TCMySqlOptions).not.toBe(null);
      expect(typeof TCMySqlOptions).toBe('object');
      expect(TCMySqlOptions.containerName).toEqual(`${containerName_prefix}-mysql`);
      expect(TCMySqlOptions.ports).toEqual([
        {
          container: 3306,
          host: 3306,
        },
      ]);
    });

    it('should be define Postgres options', async () => {
      expect(TCPostgresOptions).toBeDefined();
      expect(TCPostgresOptions).not.toBe(null);
      expect(typeof TCPostgresOptions).toBe('object');
      expect(TCPostgresOptions.containerName).toEqual(`${containerName_prefix}-postgres`);
      expect(TCPostgresOptions.ports).toEqual([
        {
          container: 5432,
          host: 5432,
        },
      ]);
    });

    it('should be define ElasticSearch options', async () => {
      expect(TCElasticSearchOptions).toBeDefined();
      expect(TCElasticSearchOptions).not.toBe(null);
      expect(typeof TCElasticSearchOptions).toBe('object');
      expect(TCElasticSearchOptions.containerName).toEqual(`${containerName_prefix}-elasticsearch`);
      expect(TCElasticSearchOptions.ports).toEqual([
        {
          container: 9200,
          host: 9200,
        },
      ]);
    });
  });
});
