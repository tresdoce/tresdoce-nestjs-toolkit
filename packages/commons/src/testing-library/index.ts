import type { Config } from 'jest';

interface IJestConfigProps {
  minCoveragePercent?: number;
}

export const minCoverageValue: number = 80;
export const maxCoverageValue: number = 100;

export const jestConfig = ({
  minCoveragePercent = minCoverageValue,
}: IJestConfigProps = {}): Config => {
  minCoveragePercent = Math.min(maxCoverageValue, Math.max(minCoverageValue, minCoveragePercent));

  return {
    moduleFileExtensions: ['js', 'json', 'ts'],
    forceExit: true,
    verbose: true,
    rootDir: '.',
    testRegex: '.*\\.(spec|it|test|e2e|e2e-spec)\\.(t|j)s$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest',
    },
    roots: ['<rootDir>/test/', '<rootDir>/src/'],
    collectCoverage: true,
    collectCoverageFrom: ['**/*.(t|j)s', '!**/*.entity.(t|j)s'],
    coverageDirectory: './coverage',
    coveragePathIgnorePatterns: [
      'node_modules',
      'node_modules/*',
      'dist',
      'dist/*',
      'src/main.ts',
      'src/*/entities/*',
    ],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['./jest.setup.ts', 'jest-extended/all'],
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
          uniqueOutputName: 'false',
          suiteNameTemplate: '{filepath}',
          includeConsoleOutput: true,
          addFileAttribute: 'true',
        },
      ],
    ],
    coverageThreshold: {
      global: {
        branches: minCoveragePercent,
        functions: minCoveragePercent,
        lines: minCoveragePercent,
        statements: minCoveragePercent,
      },
    },
  };
};
