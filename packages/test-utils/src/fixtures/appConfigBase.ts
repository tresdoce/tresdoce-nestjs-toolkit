import { Typings } from '@tresdoce-nestjs-toolkit/core';

export const appConfigBase: Typings.AppConfig = {
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
    nestJsDocs: {
      url: 'https://docs.nestjs.com',
    },
    rickAndMortyAPI: {
      url: 'https://rickandmortyapi.com/api',
      timeout: 3000,
      healthPath: '/api/character/1',
    },
  },
};
