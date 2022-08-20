const config = require('@tresdoce-nestjs-toolkit/config/jest.config');

module.exports = {
  ...config,
  rootDir: __dirname,
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
