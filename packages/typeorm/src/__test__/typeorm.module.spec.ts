import type { Mock } from 'vitest';
import 'reflect-metadata';

import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TYPE_ORM_MODULE_OPTIONS } from '../typeorm/constants/typeorm.constants.js';
import { TypeOrmClientModule } from '../typeorm/typeorm.module.js';
import { Post } from './utils/post.entity.js';
import { User } from './utils/user.entity.js';
import { configMongo, configMySql, configPostgres } from './utils/index.js';

vi.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRootAsync: vi.fn(() => ({
      module: class MockTypeOrmRootModule {},
    })),
    forFeature: vi.fn((features) => ({
      module: class MockTypeOrmFeatureModule {},
      providers: [{ provide: 'FEATURES', useValue: features }],
      exports: ['FEATURES'],
    })),
  },
}));

describe('TypeOrmClientModule', () => {
  it('should configure TypeOrmModule with the package options provider', async () => {
    const typeOrmImports = Reflect.getMetadata('imports', TypeOrmClientModule);
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'test_db',
    };
    const rootAsyncOptions = (TypeOrmModule.forRootAsync as Mock).mock.calls[0][0];

    expect(typeOrmImports).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          module: expect.any(Function),
        }),
      ]),
    );
    expect(TypeOrmModule.forRootAsync).toHaveBeenCalledWith({
      useFactory: expect.any(Function),
      inject: [TYPE_ORM_MODULE_OPTIONS],
    });
    await expect(rootAsyncOptions.useFactory(options)).resolves.toEqual(options);
  });

  it('should resolve typeorm options from ConfigService', async () => {
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'test_db',
    };
    const providers = Reflect.getMetadata('providers', TypeOrmClientModule);
    const optionsProvider = providers.find(
      (provider) => provider.provide === TYPE_ORM_MODULE_OPTIONS,
    );
    const configService = {
      get: vi.fn().mockReturnValue(options),
    } as unknown as ConfigService;

    await expect(optionsProvider.useFactory(configService)).resolves.toEqual(options);
    expect(configService.get).toHaveBeenCalledWith('config.database.typeorm');
  });

  it('should delegate forFeature to Nest TypeOrmModule', () => {
    const featureModule = TypeOrmClientModule.forFeature([Post, User]);

    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([Post, User], undefined);
    expect(featureModule).toEqual(
      expect.objectContaining({
        module: expect.any(Function),
      }),
    );
  });

  it('should forward the dataSource to Nest TypeOrmModule.forFeature', () => {
    TypeOrmClientModule.forFeature([Post], 'secondary');

    expect(TypeOrmModule.forFeature).toHaveBeenLastCalledWith([Post], 'secondary');
  });

  it('should expose database configs and test entities', () => {
    const post = new Post();
    const user = new User();

    post.id = 1;
    post.title = 'title';
    post.description = 'description';
    post.isActive = true;
    user.name = 'name';
    user.lastname = 'lastname';

    expect(configPostgres()).toEqual(
      expect.objectContaining({
        database: {
          typeorm: expect.objectContaining({ type: 'postgres' }),
        },
      }),
    );
    expect(configMySql()).toEqual(
      expect.objectContaining({
        database: {
          typeorm: expect.objectContaining({ type: 'mysql' }),
        },
      }),
    );
    expect(configMongo()).toEqual(
      expect.objectContaining({
        database: {
          typeorm: expect.objectContaining({ type: 'mongodb' }),
        },
      }),
    );
    expect(post).toEqual({
      id: 1,
      title: 'title',
      description: 'description',
      isActive: true,
    });
    expect(user).toEqual({
      name: 'name',
      lastname: 'lastname',
    });
  });
});
