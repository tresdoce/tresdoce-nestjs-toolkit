module.exports = {
  description: 'Generate new Package',
  prompts: [
    {
      type: 'input',
      name: 'packageName',
      message: 'Package name please',
    },
  ],
  actions: () => {
    let actions = [];
    actions = actions.concat(
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/tsconfig.json',
        templateFile: 'plops-templates/packages/basic/tsconfig.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/tsconfig.build.json',
        templateFile: 'plops-templates/packages/basic/tsconfig.build.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/package.json',
        templateFile: 'plops-templates/packages/basic/package.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/nest-cli.json',
        templateFile: 'plops-templates/packages/basic/nest-cli.json.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/jest.config.js',
        templateFile: 'plops-templates/packages/basic/jest.config.js.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/CHANGELOG.md',
        templateFile: 'plops-templates/packages/basic/CHANGELOG.md.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/license.md',
        templateFile: 'plops-templates/packages/basic/license.md.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/src/index.ts',
        templateFile: 'plops-templates/packages/basic/src/index.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/src/greeting/greeting.module.ts',
        templateFile: 'plops-templates/packages/basic/src/greeting/greeting.module.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/src/greeting/services/greeting.service.ts',
        templateFile:
          'plops-templates/packages/basic/src/greeting/services/greeting.service.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/src/__test__/greeting.module.spec.ts',
        templateFile: 'plops-templates/packages/basic/src/__test__/greeting.module.spec.ts.hbs',
      },
      {
        type: 'add',
        path: 'packages/{{kebabCase packageName}}/src/__test__/greeting.service.spec.ts',
        templateFile: 'plops-templates/packages/basic/src/__test__/greeting.service.spec.ts.hbs',
      },
    );
    return actions;
  },
};
