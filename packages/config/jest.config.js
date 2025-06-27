const path = require('path');

process.env.NODE_ENV = 'test';
//process.env.DEBUG = 'testcontainers*'

module.exports = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  forceExit: true,
  verbose: true,
  rootDir: '.',
  testRegex: '.*\\.(spec|it|test|e2e|e2e-spec)\\.(t|j)s$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: true }],
  },
  transformIgnorePatterns: ['/node_modules/(?!glob|brace-expansion|balanced-match|minimatch)'],
  roots: ['<rootDir>/src/'],
  collectCoverage: true,
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['node_modules', 'node_modules/*', 'dist', 'dist/*', 'src/index.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: [path.join(__dirname, './jest.setup.js'), 'jest-extended/all'],
  moduleDirectories: ['node_modules'],
  preset: 'ts-jest',
  testResultsProcessor: 'jest-sonar-reporter',
  displayName: `${process.env.npm_package_name}`,
  coverageReporters: ['html', 'text', 'text-summary', 'cobertura', 'clover', 'json', 'lcov'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        classNameTemplate: `{classname}`,
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        //suiteNameTemplate: `${process.env.npm_package_name}`,
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        includeConsoleOutput: true,
        addFileAttribute: 'true',
      },
    ],
    /*[
      path.join(__dirname, './jest-mochawesome-reporter.js'),
      {
        reportDir: 'test-results',
        reportFilename: 'test-report.json',
      },
    ],*/
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
