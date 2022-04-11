import { Typings } from '@tresdoce-nestjs-toolkit/core';

export const mockedConfig: Typings.AppConfig = {
  project: {
    apiPrefix: 'API-TEST',
    name: 'nestjs-starter-test',
    version: '0.0.1',
    description: 'NestJS Starter',
    author: {
      name: 'Maximiliano "Mex" Delgado',
      email: 'mdelgado@tresdoce.com.ar',
      url: 'https://rudemex.github.io/',
    },
    repository: {
      type: 'git',
      url: 'git+https://github.com/tresdoce/tresdoce-nestjs-toolkit.git',
    },
    bugs: {
      url: 'https://github.com/tresdoce/tresdoce-nestjs-toolkit/issues',
    },
    homepage: 'https://github.com/tresdoce/tresdoce-nestjs-toolkit#readme',
  },
  server: {
    isProd: false,
    port: 8081,
    context: 'api',
    origins: ['http://localhost:3000', 'http://localhost:8080'],
    allowedHeaders:
      'Content-Type,Authorization,Set-Cookie,Access-Control-Allow-Origin,Cache-Control,Pragma',
    allowedMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
    corsEnabled: true,
    corsCredentials: false,
  },
  swagger: { path: 'docs', enabled: false },
  params: { testEnv: 'testKeyEnv-test' },
  services: {
    nestJsDocs: { url: 'https://docs.nestjs.com' },
    rickAndMortyAPI: { url: 'https://rickandmortyapi.com/api', timeout: 3000 },
  },
};

export const mockManifest = {
  archetypeVersion: '0.0.1',
  apiPrefix: mockedConfig.project.apiPrefix,
  name: mockedConfig.project.name,
  version: mockedConfig.project.version,
  description: mockedConfig.project.description,
  author: mockedConfig.project.author,
  repository: mockedConfig.project.repository,
  homepage: mockedConfig.project.homepage,
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
