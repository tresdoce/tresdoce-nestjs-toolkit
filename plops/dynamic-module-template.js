export default {
  description: '✨ Generate new Dynamic Module',
  prompts: [
    {
      type: 'input',
      name: 'moduleName',
      message: '📦 Module name: ',
    },
    {
      type: 'input',
      name: 'moduleDescription',
      message: '🗒️ Module description: ',
    },
  ],
  actions: () => {
    let actions = [];
    actions = actions.concat(
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/tsconfig.json',
        templateFile: 'plops-templates/packages/dynamicModule/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/tsconfig.build.json',
        templateFile: 'plops-templates/packages/dynamicModule/tsconfig.build.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/README.md',
        templateFile: 'plops-templates/packages/dynamicModule/README.md.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/package.json',
        templateFile: 'plops-templates/packages/dynamicModule/package.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/nest-cli.json',
        templateFile: 'plops-templates/packages/dynamicModule/nest-cli.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/vitest.config.ts',
        templateFile: 'plops-templates/packages/dynamicModule/vitest.config.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/license.md',
        templateFile: 'plops-templates/packages/dynamicModule/license.md.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/CHANGELOG.md',
        templateFile: 'plops-templates/packages/dynamicModule/CHANGELOG.md.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/index.ts',
        templateFile: 'plops-templates/packages/dynamicModule/src/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/{{camelCase moduleName}}/{{camelCase moduleName}}.module.ts',
        templateFile: 'plops-templates/packages/dynamicModule/src/greeting/greeting.module.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/{{camelCase moduleName}}/services/{{camelCase moduleName}}.service.ts',
        templateFile:
          'plops-templates/packages/dynamicModule/src/greeting/services/greeting.service.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/{{camelCase moduleName}}/interfaces/{{camelCase moduleName}}.interface.ts',
        templateFile:
          'plops-templates/packages/dynamicModule/src/greeting/interfaces/greeting.interface.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/{{camelCase moduleName}}/constants/{{camelCase moduleName}}.constant.ts',
        templateFile:
          'plops-templates/packages/dynamicModule/src/greeting/constants/greeting.constant.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/__test__/{{camelCase moduleName}}.module.spec.ts',
        templateFile:
          'plops-templates/packages/dynamicModule/src/__test__/greeting.module.spec.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase moduleName}}/src/__test__/{{camelCase moduleName}}.service.spec.ts',
        templateFile:
          'plops-templates/packages/dynamicModule/src/__test__/greeting.service.spec.ts.hbs',
      },
      {
        type: 'modify',
        path: 'README.md',
        template:
          '| [`@tresdoce-nestjs-toolkit/{{kebabCase moduleName}}`](./packages/{{kebabCase moduleName}}) | {{moduleDescription}} | [![version](https://img.shields.io/npm/v/@tresdoce-nestjs-toolkit/{{kebabCase moduleName}}.svg)](https://www.npmjs.com/package/@tresdoce-nestjs-toolkit/{{kebabCase moduleName}}) | [Changelog](./packages/{{kebabCase moduleName}}/CHANGELOG.md) |\n$1',
        pattern: /(<!---PLOP-TOOLKIT-TABLE-->)/g,
      },
    );
    return actions;
  },
};
