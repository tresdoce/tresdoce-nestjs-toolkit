import { Inject, Injectable } from '@nestjs/common';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';

import { CONFIG_OPTIONS } from '../constants/archetype.constants';

@Injectable()
export class ArchetypeService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly configService: Typings.AppConfig) {}

  async readFile(pathSegment, filename) {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  async getArchetypeVersion() {
    const { version } = await this.readFile(__dirname, '../package.json');

    return {
      archetypeVersion: version,
    };
  }

  async getApplicationInfo() {
    const {
      project: { apiPrefix, name, version, description, author, repository, homepage },
      server: { appStage },
    } = this.configService;
    const { dependencies, devDependencies } = await this.readFile(process.cwd(), './package.json');

    const dependenciesList = _.pickBy(
      dependencies,
      (_value, _key) => _key.startsWith('@tresdoce-nestjs-toolkit') || _key.startsWith('@nestjs'),
    );
    const devDependenciesList = _.pickBy(
      devDependencies,
      (_value, _key) => _key.startsWith('@tresdoce-nestjs-toolkit') || _key.startsWith('@nestjs'),
    );

    return {
      appStage,
      apiPrefix,
      name,
      version,
      description,
      author,
      repository,
      homepage,
      dependencies: dependenciesList,
      devDependencies: devDependenciesList,
    };
  }

  async generateManifest() {
    return {
      ...(await this.getArchetypeVersion()),
      ...(await this.getApplicationInfo()),
    };
  }
}
