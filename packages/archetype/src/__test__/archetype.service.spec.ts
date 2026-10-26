import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

import { config, manifest } from '@tresdoce-nestjs-toolkit/test-utils';

import { ArchetypeModule } from '../archetype/archetype.module.js';
import { ArchetypeService } from '../archetype/services/archetype.service.js';

const pickToolkitAndNest = (deps: Record<string, string> = {}) =>
  Object.fromEntries(
    Object.entries(deps).filter(
      ([name]) => name.startsWith('@tresdoce-nestjs-toolkit') || name.startsWith('@nestjs'),
    ),
  );

describe('ArchetypeService', () => {
  let service: ArchetypeService;
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
    const packageFile = await service.readFile(import.meta.dirname, '../../package.json');
    expect(packageFile).toBeDefined();
    expect(packageFile).toEqual(expect.any(Object));
  });

  it('should be return archetype version', async () => {
    service.readFile = vi.fn().mockImplementation(() => ({ version: manifest.archetypeVersion }));

    expect(await service.getArchetypeVersion()).toEqual({
      archetypeVersion: manifest.archetypeVersion,
    });
  });

  it('should be return application info', async () => {
    service.readFile = vi.fn().mockImplementation(() => ({
      appStage: manifest.appStage,
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
      appStage: manifest.appStage,
      apiPrefix: manifest.apiPrefix,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      repository: manifest.repository,
      homepage: manifest.homepage,
      // Only toolkit and Nest packages are listed; derived from the fixture so it stays in sync.
      dependencies: pickToolkitAndNest(manifest.dependencies),
      devDependencies: pickToolkitAndNest(manifest.devDependencies),
      currentCommit: '',
      seed: {},
    });
  });

  it('should include the seed info and the current commit when available', async () => {
    vi.stubEnv('CURRENT_COMMIT', 'abcd1234');
    service.readFile = vi.fn().mockImplementation(() => ({
      dependencies: {},
      devDependencies: {},
      seed: { name: 'nestjs-starter', version: '5.0.0' },
    }));

    const info = await service.getApplicationInfo();

    expect(info.currentCommit).toBe('abcd1234');
    expect(info.seed).toEqual({ name: 'nestjs-starter', version: '5.0.0' });
    vi.unstubAllEnvs();
  });

  it('should return empty dependency lists when the app package.json has none', async () => {
    service.readFile = vi.fn().mockImplementation(() => ({}));

    const info = await service.getApplicationInfo();

    expect(info.dependencies).toEqual({});
    expect(info.devDependencies).toEqual({});
    expect(info.seed).toEqual({});
  });

  it('should read the archetype version from its own package.json', async () => {
    const ownPackage = await service.readFile(import.meta.dirname, '../../package.json');

    expect(await service.getArchetypeVersion()).toEqual({ archetypeVersion: ownPackage.version });
  });

  it('should throw InternalServerErrorException when the file does not exist', async () => {
    const missingFile = path.resolve(import.meta.dirname, 'nonexistent-package.json');

    const promise = service.readFile(import.meta.dirname, 'nonexistent-package.json');

    await expect(promise).rejects.toBeInstanceOf(InternalServerErrorException);
    await expect(promise).rejects.toThrow(`ArchetypeService: unable to read file "${missingFile}"`);
    await expect(promise).rejects.toMatchObject({
      cause: expect.objectContaining({ code: 'ENOENT' }),
    });
  });

  it('should throw InternalServerErrorException when the file contains invalid JSON', async () => {
    const invalidFile = path.resolve(import.meta.dirname, 'invalid.json');
    fs.writeFileSync(invalidFile, '{ this is not valid json');

    try {
      const promise = service.readFile(import.meta.dirname, 'invalid.json');

      await expect(promise).rejects.toBeInstanceOf(InternalServerErrorException);
      await expect(promise).rejects.toThrow(
        `ArchetypeService: invalid JSON in file "${invalidFile}"`,
      );
      await expect(promise).rejects.toMatchObject({ cause: expect.any(SyntaxError) });
    } finally {
      fs.unlinkSync(invalidFile);
    }
  });

  it('should be return manifest', async () => {
    service.getArchetypeVersion = vi.fn().mockImplementation(() => ({
      archetypeVersion: manifest.archetypeVersion,
    }));

    service.getApplicationInfo = vi.fn().mockImplementation(() => ({
      appStage: manifest.appStage,
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
