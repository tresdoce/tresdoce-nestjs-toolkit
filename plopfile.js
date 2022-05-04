const { packageTemplate } = require('./plops');

const config = (plop) => {
    plop.setGenerator('Package template', packageTemplate);
    plop.setHelper('configVersion', () => require('./packages/config/package.json').version);
    plop.setHelper('typesVersion', () => require('./packages/tresdoce-types/package.json').version);
};

module.exports = config;
