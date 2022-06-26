const config = require('@tresdoce-nestjs-toolkit/config/jest.config');

module.exports = {
  ...config,
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  rootDir: __dirname,
};
