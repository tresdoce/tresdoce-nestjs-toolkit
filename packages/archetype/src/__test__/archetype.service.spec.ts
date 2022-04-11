import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { ArchetypeModule } from '../archetype/archetype.module';
import { ArchetypeService } from '../archetype/services/archetype.service';

import { config, mockManifest } from './utils';

describe('ArchetypeService', () => {
  let service: ArchetypeService;
  /*const archetypeService = {
      readFile: jest.fn(() => mockManifest),
      getArchetypeVersion: jest.fn(() => ({ archetypeVersion: mockManifest.archetypeVersion })),
      getApplicationInfo: jest.fn(() => ({
        name: mockManifest.name,
        version: mockManifest.version,
        description: mockManifest.description,
        author: mockManifest.author,
        repository: mockManifest.repository,
        homepage: mockManifest.homepage,
        dependencies: mockManifest.dependencies,
        devDependencies: mockManifest.devDependencies,
      })),
      generateManifest: jest.fn(() => mockManifest),
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
    service.readFile = jest
      .fn()
      .mockImplementation(() => ({ version: mockManifest.archetypeVersion }));

    expect(await service.getArchetypeVersion()).toEqual({
      archetypeVersion: mockManifest.archetypeVersion,
    });
  });

  it('should be return application info', async () => {
    service.readFile = jest.fn().mockImplementation(() => ({
      apiPrefix: mockManifest.apiPrefix,
      name: mockManifest.name,
      version: mockManifest.version,
      description: mockManifest.description,
      author: mockManifest.author,
      repository: mockManifest.repository,
      homepage: mockManifest.homepage,
      dependencies: mockManifest.dependencies,
      devDependencies: mockManifest.devDependencies,
    }));

    expect(await service.getApplicationInfo()).toEqual({
      apiPrefix: mockManifest.apiPrefix,
      name: mockManifest.name,
      version: mockManifest.version,
      description: mockManifest.description,
      author: mockManifest.author,
      repository: mockManifest.repository,
      homepage: mockManifest.homepage,
      dependencies: {
        '@tresdoce-nestjs-toolkit/archetype': '0.0.1',
        '@tresdoce-nestjs-toolkit/health': '0.0.1',
        '@tresdoce-nestjs-toolkit/httpclient': '0.0.1',
        '@nestjs/class-transformer': '^0.4.0',
        '@nestjs/class-validator': '^0.13.3',
        '@nestjs/common': '^8.2.5',
        '@nestjs/config': '^1.1.6',
        '@nestjs/core': '^8.2.5',
        '@nestjs/platform-express': '^8.2.5',
        '@nestjs/swagger': '^5.1.5',
      },
      devDependencies: {
        '@tresdoce-nestjs-toolkit/commons': '0.0.1',
        '@nestjs/cli': '^8.2.0',
        '@nestjs/schematics': '^8.0.4',
        '@nestjs/testing': '^8.2.5',
      },
    });
  });

  it('should be return manifest', async () => {
    service.getArchetypeVersion = jest.fn().mockImplementation(() => ({
      archetypeVersion: mockManifest.archetypeVersion,
    }));

    service.getApplicationInfo = jest.fn().mockImplementation(() => ({
      apiPrefix: mockManifest.apiPrefix,
      name: mockManifest.name,
      version: mockManifest.version,
      description: mockManifest.description,
      author: mockManifest.author,
      repository: mockManifest.repository,
      homepage: mockManifest.homepage,
      dependencies: mockManifest.dependencies,
      devDependencies: mockManifest.devDependencies,
    }));

    expect(await service.generateManifest()).toEqual({ ...mockManifest });
  });
});
