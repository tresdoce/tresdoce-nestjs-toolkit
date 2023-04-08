import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { config, manifest } from '@tresdoce-nestjs-toolkit/test-utils';

import { ArchetypeModule } from '../archetype/archetype.module';
import { ArchetypeService } from '../archetype/services/archetype.service';

describe('ArchetypeService', () => {
  let service: ArchetypeService;
  /*const archetypeService = {
      readFile: jest.fn(() => manifest),
      getArchetypeVersion: jest.fn(() => ({ archetypeVersion: manifest.archetypeVersion })),
      getApplicationInfo: jest.fn(() => ({
        name: manifest.name,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author,
        repository: manifest.repository,
        homepage: manifest.homepage,
        dependencies: manifest.dependencies,
        devDependencies: manifest.devDependencies,
      })),
      generateManifest: jest.fn(() => manifest),
    };*/

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        ArchetypeModule,
      ],
      providers: [ArchetypeService],
    }).compile();

    service = module.get<ArchetypeService>(ArchetypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be read package file', async () => {
    const packageFile = await service.readFile(__dirname, '../../package.json');
    expect(packageFile).toBeDefined();
    expect(packageFile).toEqual(expect.any(Object));
  });

  it('should be return archetype version', async () => {
    service.readFile = jest.fn().mockImplementation(() => ({ version: manifest.archetypeVersion }));

    expect(await service.getArchetypeVersion()).toEqual({
      archetypeVersion: manifest.archetypeVersion,
    });
  });

  it('should be return application info', async () => {
    service.readFile = jest.fn().mockImplementation(() => ({
      apiPrefix: manifest.apiPrefix,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      repository: manifest.repository,
      homepage: manifest.homepage,
      dependencies: manifest.dependencies,
      devDependencies: manifest.devDependencies,
    }));

    expect(await service.getApplicationInfo()).toEqual({
      apiPrefix: manifest.apiPrefix,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      repository: manifest.repository,
      homepage: manifest.homepage,
      dependencies: {
        '@tresdoce-nestjs-toolkit/archetype': '0.0.1',
        '@tresdoce-nestjs-toolkit/health': '0.0.1',
        '@tresdoce-nestjs-toolkit/http-client': '0.0.1',
        '@nestjs/class-transformer': '^0.4.0',
        '@nestjs/class-validator': '^0.13.3',
        '@nestjs/common': '^9.2.1',
        '@nestjs/config': '^2.2.0',
        '@nestjs/core': '^8.2.5',
        '@nestjs/platform-express': '^8.2.5',
        '@nestjs/swagger': '^5.1.5',
      },
      devDependencies: {
        '@tresdoce-nestjs-toolkit/commons': '0.0.1',
        '@nestjs/cli': '^9.1.8',
        '@nestjs/schematics': '^9.1.0',
        '@nestjs/testing': '^9.4.0',
      },
    });
  });

  it('should be return manifest', async () => {
    service.getArchetypeVersion = jest.fn().mockImplementation(() => ({
      archetypeVersion: manifest.archetypeVersion,
    }));

    service.getApplicationInfo = jest.fn().mockImplementation(() => ({
      apiPrefix: manifest.apiPrefix,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      repository: manifest.repository,
      homepage: manifest.homepage,
      dependencies: manifest.dependencies,
      devDependencies: manifest.devDependencies,
    }));

    expect(await service.generateManifest()).toEqual({ ...manifest });
  });
});
