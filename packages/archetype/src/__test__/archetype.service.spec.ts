import { Test, TestingModule } from '@nestjs/testing';
import { ArchetypeService } from '../lib/services/archetype.service';
//import * as path from 'path';
//import * as fs from 'fs';

const mockManifest = {
  archetypeVersion: '0.0.1',
  name: 'starter-nestjs',
  version: '1.0.0',
  description: 'Arquetipo Node (NestJs)',
  author: {
    name: 'Maximiliano "Mex" Delgado',
    email: 'mdelgado@tresdoce.com.ar',
    url: 'https://rudemex.github.io/',
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/rudemex/nestjs-package-starter.git',
  },
  homepage: 'https://github.com/rudemex/nestjs-package-starter#readme',
  dependencies: {
    '@tresdoce/archetype': './tresdoce-archetype-0.0.1.tgz',
    '@tresdoce/filters': '0.0.2',
    '@tresdoce/health': '0.0.3',
    '@tresdoce/response-parser': '0.0.2',
    '@nestjs/class-transformer': '^0.4.0',
    '@nestjs/class-validator': '^0.13.3',
    '@nestjs/common': '^8.2.5',
    '@nestjs/config': '^1.1.6',
    '@nestjs/core': '^8.2.5',
    '@nestjs/platform-express': '^8.2.5',
    '@nestjs/swagger': '^5.1.5',
    'cross-env': '^7.0.3',
    'swagger-ui-express': '^4.3.0',
  },
  devDependencies: {
    '@tresdoce/commons': '0.0.2',
    '@nestjs/cli': '^8.2.0',
    '@nestjs/schematics': '^8.0.4',
    '@nestjs/testing': '^8.2.5',
    husky: '^4.3.8',
    jest: '^27.4.7',
  },
};

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
      name: mockManifest.name,
      version: mockManifest.version,
      description: mockManifest.description,
      author: mockManifest.author,
      repository: mockManifest.repository,
      homepage: mockManifest.homepage,
      dependencies: {
        '@tresdoce/archetype': './tresdoce-archetype-0.0.1.tgz',
        '@tresdoce/filters': '0.0.2',
        '@tresdoce/health': '0.0.3',
        '@tresdoce/response-parser': '0.0.2',
        '@nestjs/class-transformer': '^0.4.0',
        '@nestjs/class-validator': '^0.13.3',
        '@nestjs/common': '^8.2.5',
        '@nestjs/config': '^1.1.6',
        '@nestjs/core': '^8.2.5',
        '@nestjs/platform-express': '^8.2.5',
        '@nestjs/swagger': '^5.1.5',
      },
      devDependencies: {
        '@tresdoce/commons': '0.0.2',
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
