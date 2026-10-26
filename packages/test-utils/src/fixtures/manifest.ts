import { appConfigBase } from './appConfigBase.js';

export const manifest = {
  appStage: appConfigBase.server.appStage,
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
    '@nestjs/common': '^12.2.0',
    '@nestjs/config': '^12.0.1',
    '@nestjs/core': '^12.2.0',
    '@nestjs/platform-express': '^12.2.0',
    '@nestjs/swagger': '^12.0.0',
    zod: '^4.0.0',
  },
  devDependencies: {
    '@tresdoce-nestjs-toolkit/commons': '0.0.1',
    '@nestjs/cli': '^12.0.0',
    '@nestjs/schematics': '^12.0.0',
    '@nestjs/testing': '^12.2.0',
    oxlint: '^1.0.0',
    vitest: '^5.0.0',
  },
};
