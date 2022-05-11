const config = require('@tresdoce-nestjs-toolkit/config/jest.config');

module.exports = {
  ...config,
  //coveragePathIgnorePatterns: [...config.coveragePathIgnorePatterns, 'src/testcontainers'],
  rootDir: __dirname,
};
