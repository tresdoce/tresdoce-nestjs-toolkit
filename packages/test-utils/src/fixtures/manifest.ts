import { appConfigBase } from './appConfigBase';

export const manifest = {
  archetypeVersion: '0.0.1',
  apiPrefix: appConfigBase.project.apiPrefix,
  name: appConfigBase.project.name,
  version: appConfigBase.project.version,
  description: appConfigBase.project.description,
  author: appConfigBase.project.author,
  repository: appConfigBase.project.repository,
  homepage: appConfigBase.project.homepage,
  dependencies: {
    '@tresdoce-nestjs-toolkit/archetype': '0.0.1',
    '@tresdoce-nestjs-toolkit/health': '0.0.1',
    '@tresdoce-nestjs-toolkit/http-client': '0.0.1',
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
    '@tresdoce-nestjs-toolkit/commons': '0.0.1',
    '@nestjs/cli': '^8.2.0',
    '@nestjs/schematics': '^8.0.4',
    '@nestjs/testing': '^8.2.5',
    husky: '^4.3.8',
    jest: '^27.4.7',
  },
};
