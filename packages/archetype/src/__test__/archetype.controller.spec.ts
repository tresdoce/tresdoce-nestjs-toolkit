import { Test, TestingModule } from '@nestjs/testing';
import { ArchetypeController } from '../lib/controllers/archetype.controller';
import { ArchetypeService } from '../lib/services/archetype.service';

const mockManifest = {
  archetypeVersion: '0.0.1',
  name: 'galicia-starter-nestjs',
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

describe('ArchetypeController', () => {
  let controller: ArchetypeController;
  const archetypeService = {
    generateManifest: () => mockManifest,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchetypeController],
      providers: [ArchetypeService],
    })
      .overrideProvider(ArchetypeService)
      .useValue(archetypeService)
      .compile();

    controller = module.get<ArchetypeController>(ArchetypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be return manifest json', async () => {
    expect(await controller.getArchetypeInfo()).toBeDefined();
    expect(await controller.getArchetypeInfo()).toEqual(mockManifest);
  });
});
