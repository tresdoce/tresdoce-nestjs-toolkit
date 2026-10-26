import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { Typings } from '@tresdoce-nestjs-toolkit/core';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { CONFIG_OPTIONS } from '../constants/archetype.constants.js';
import type {
  IApplicationInfo,
  IArchetypeManifest,
  IArchetypeVersion,
} from '../interfaces/archetype.interface.js';

const MANIFEST_DEPENDENCY_PREFIXES = ['@tresdoce-nestjs-toolkit', '@nestjs'];

const filterManifestDependencies = (
  dependencies: Record<string, string> = {},
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(dependencies).filter(([name]) =>
      MANIFEST_DEPENDENCY_PREFIXES.some((prefix) => name.startsWith(prefix)),
    ),
  );

@Injectable()
export class ArchetypeService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly configService: Typings.AppConfig) {}

  async readFile(pathSegment: string, filename: string): Promise<any> {
    const file = path.resolve(pathSegment, filename);
    let raw: string;

    try {
      raw = await readFile(file, 'utf8');
    } catch (error) {
      throw new InternalServerErrorException(`ArchetypeService: unable to read file "${file}"`, {
        cause: error,
      });
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new InternalServerErrorException(`ArchetypeService: invalid JSON in file "${file}"`, {
        cause: error,
      });
    }
  }

  /**
   * Directorio raíz del paquete archetype. Se busca subiendo carpetas porque la
   * profundidad cambia entre el código fuente (src/archetype/services) y el build.
   */
  private findOwnPackageDir(): string {
    let dir = import.meta.dirname;
    while (!existsSync(path.resolve(dir, 'package.json'))) {
      const parent = path.dirname(dir);
      /* istanbul ignore next */
      if (parent === dir) {
        throw new InternalServerErrorException('ArchetypeService: package.json not found');
      }
      dir = parent;
    }
    return dir;
  }

  async getArchetypeVersion(): Promise<IArchetypeVersion> {
    const { version } = await this.readFile(this.findOwnPackageDir(), 'package.json');

    return {
      archetypeVersion: version,
    };
  }

  async getApplicationInfo(): Promise<IApplicationInfo> {
    const {
      project: { apiPrefix, name, version, description, author, repository, homepage },
      server: { appStage },
    } = this.configService;
    const {
      dependencies,
      devDependencies,
      seed = {},
    } = await this.readFile(process.cwd(), 'package.json');

    return {
      appStage,
      apiPrefix,
      name,
      version,
      description,
      author,
      repository,
      homepage,
      dependencies: filterManifestDependencies(dependencies),
      devDependencies: filterManifestDependencies(devDependencies),
      currentCommit: process.env.CURRENT_COMMIT || '',
      seed,
    };
  }

  async generateManifest(): Promise<IArchetypeManifest> {
    const [archetypeVersion, applicationInfo] = await Promise.all([
      this.getArchetypeVersion(),
      this.getApplicationInfo(),
    ]);

    return {
      ...archetypeVersion,
      ...applicationInfo,
    };
  }
}
