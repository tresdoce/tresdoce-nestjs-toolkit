const config = require('@tresdoce-nestjs-toolkit/config/jest.config');
const path = require('path');

module.exports = {
  ...config,
  rootDir: path.join(__dirname),
};
