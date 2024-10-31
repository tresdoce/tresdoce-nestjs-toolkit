const { dynamicModuleTemplate, basicPackageTemplate } = require('./plops');

const config = (plop) => {
    plop.setGenerator('Dynamic Module template', dynamicModuleTemplate);
    plop.setGenerator('Basic package template', basicPackageTemplate);
    plop.setHelper('configVersion', () => require('./packages/config/package.json').version);
    plop.setHelper('typesVersion', () => require('./packages/tresdoce-types/package.json').version);
};

module.exports = config;
