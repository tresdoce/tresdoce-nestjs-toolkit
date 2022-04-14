import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ArchetypeService {
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
      name,
      version,
      description,
      author,
      repository,
      homepage,
      dependencies,
      devDependencies,
    } = await this.readFile(process.cwd(), './package.json');

    const dependenciesList = _.pickBy(
      dependencies,
      (value, key) => key.startsWith('@tresdoce') || key.startsWith('@nestjs'),
    );
    const devDependenciesList = _.pickBy(
      devDependencies,
      (value, key) => key.startsWith('@tresdoce') || key.startsWith('@nestjs'),
    );

    return {
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
