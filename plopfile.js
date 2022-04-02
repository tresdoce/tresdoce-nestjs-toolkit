const { packageTemplate } = require("./plops");

const config = plop => {
    plop.setGenerator('Package template', packageTemplate);
}

module.exports = config;
