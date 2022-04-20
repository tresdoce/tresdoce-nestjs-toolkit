const {packageTemplate} = require('./plops');

const config = (plop) => {
    plop.setGenerator('Package template', packageTemplate);
    plop.setHelper('configVersion', () => {
        const pkgJson = require('./packages/config/package.json');
        return pkgJson.version;
    });
    plop.setHelper('typesVersion', () => {
        const pkgJson = require('./packages/tresdoce-types/package.json');
        return pkgJson.version;
    });
};

module.exports = config;
