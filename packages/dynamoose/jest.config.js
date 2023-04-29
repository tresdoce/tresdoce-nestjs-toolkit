const config = require('@tresdoce-nestjs-toolkit/config/jest.config');

module.exports = {
  ...config,
  rootDir: __dirname,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
