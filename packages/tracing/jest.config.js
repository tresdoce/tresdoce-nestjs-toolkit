const config = require('@tresdoce-nestjs-toolkit/config/jest.config');
//const path = require('path');

module.exports = {
  ...config,
  rootDir: __dirname,
  //globalSetup: path.resolve(__dirname, './jest.globalSetup.ts'),
  //globalTeardown: path.resolve(__dirname, './jest.globalTeardown.ts'),
};
