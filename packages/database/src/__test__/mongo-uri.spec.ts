import { ConfigService } from '@nestjs/config';
import { buildMongoUri, encodeUriComponent } from '../mongo/utils/mongo-uri.util.js';
import { MONGO_CONFIG_KEY, mongoOptionsFactory } from '../mongo/mongo.factory.js';
import * as database from '../index.js';
import { Schema, Types, isValidObjectId, mongoose } from '../index.js';

describe('buildMongoUri', () => {
  it('should build a uri with only host', () => {
    expect(buildMongoUri({ host: 'localhost' })).toBe('mongodb://localhost');
  });

  it('should build a full uri with credentials, port, database and authSource', () => {
    expect(
      buildMongoUri({
        connection: 'mongodb',
        host: 'localhost',
        port: 27017,
        username: 'root',
        password: '123456',
        database: 'test_db',
        authSource: 'admin',
      }),
    ).toBe('mongodb://root:123456@localhost:27017/test_db?authSource=admin');
  });

  it('should encode special characters in username, password and database', () => {
    expect(
      buildMongoUri({ host: 'h', username: 'us@er', password: 'p@ss:w/rd%', database: 'my db' }),
    ).toBe('mongodb://us%40er:p%40ss%3Aw%2Frd%25@h/my%20db');
  });

  it('should not double encode already encoded values', () => {
    expect(
      buildMongoUri({
        host: 'h',
        username: encodeURIComponent('us@er'),
        password: encodeURIComponent('p@ss'),
        authSource: encodeURIComponent('admin'),
      }),
    ).toBe('mongodb://us%40er:p%40ss@h/?authSource=admin');
  });

  it('should ignore password without username', () => {
    expect(buildMongoUri({ host: 'h', password: 'secret' })).toBe('mongodb://h');
  });

  it('should build credentials without password', () => {
    expect(buildMongoUri({ host: 'h', username: 'user' })).toBe('mongodb://user@h');
  });

  it('should omit the port for mongodb+srv and invalid ports', () => {
    expect(
      buildMongoUri({ connection: 'mongodb+srv', host: 'cluster.example.net', port: 27017 }),
    ).toBe('mongodb+srv://cluster.example.net');
    expect(buildMongoUri({ host: 'h', port: Number.NaN })).toBe('mongodb://h');
  });

  it('should append extra params skipping nullish values', () => {
    expect(
      buildMongoUri({
        host: 'h',
        database: 'db',
        authSource: 'admin',
        params: { replicaSet: 'rs0', retryWrites: true, maxPoolSize: 10, tls: undefined, w: null },
      }),
    ).toBe('mongodb://h/db?authSource=admin&replicaSet=rs0&retryWrites=true&maxPoolSize=10');
  });

  it('should return the uri as is when defined', () => {
    expect(buildMongoUri({ uri: 'mongodb://custom:27017/db', host: 'ignored' })).toBe(
      'mongodb://custom:27017/db',
    );
  });

  it('should throw when neither host nor uri are defined', () => {
    expect(() => buildMongoUri({})).toThrow('`host` or `uri` is required');
  });

  it('should keep invalid percent sequences when encoding', () => {
    expect(encodeUriComponent('100%')).toBe('100%25');
    expect(encodeUriComponent(27017)).toBe('27017');
  });
});

describe('mongoOptionsFactory', () => {
  const configServiceWith = (value: unknown) =>
    ({ get: vi.fn(() => value) }) as unknown as ConfigService;

  it('should read config.database.mongo and return the uri with connection options', () => {
    const configService = configServiceWith({
      host: 'localhost',
      port: 27017,
      connectionOptions: { retryAttempts: 2, serverSelectionTimeoutMS: 1000 },
    });
    expect(mongoOptionsFactory(configService)).toEqual({
      retryAttempts: 2,
      serverSelectionTimeoutMS: 1000,
      uri: 'mongodb://localhost:27017',
    });
    expect(configService.get).toHaveBeenCalledWith(MONGO_CONFIG_KEY);
  });

  it('should throw a clear error when the config is missing', () => {
    expect(() => mongoOptionsFactory(configServiceWith(undefined))).toThrow(
      "Missing 'config.database.mongo' configuration",
    );
  });
});

describe('index exports', () => {
  it('should export the module, helpers and @nestjs/mongoose decorators', () => {
    expect(database.MongoModule).toBeDefined();
    expect(typeof database.MongoModule.forFeature).toBe('function');
    expect(typeof database.buildMongoUri).toBe('function');
    expect(typeof database.InjectModel).toBe('function');
    expect(typeof database.getModelToken).toBe('function');
  });

  it('should re-export mongoose in ESM', () => {
    expect(typeof Schema).toBe('function');
    expect(Types.ObjectId).toBeDefined();
    expect(typeof isValidObjectId).toBe('function');
    expect(mongoose.connection).toBeDefined();
    expect(mongoose.Schema).toBe(Schema);
  });

  it('should return a dynamic module on forFeature', () => {
    const dynamicModule = database.MongoModule.forFeature([
      { name: 'Cat', schema: new Schema({ name: String }) },
    ]);
    expect(dynamicModule.providers).toHaveLength(1);
  });
});
