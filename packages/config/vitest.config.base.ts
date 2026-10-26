import path from 'node:path';
import { defineConfig } from 'vitest/config';
import { ignoreDecoratorMetadataCoverage } from './vitest.plugins.ts';

process.env.NODE_ENV = 'test';

/**
 * Shared Vitest config for every package. Each package's vitest.config.ts merges it:
 *
 *   import { mergeConfig } from 'vitest/config';
 *   import base from '@tresdoce-nestjs-toolkit/config/vitest';
 *   export default mergeConfig(base, { test: { name: 'core' } });
 */
export default defineConfig({
  plugins: [ignoreDecoratorMetadataCoverage()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{spec,it,test,e2e,e2e-spec}.ts'],
    passWithNoTests: true,
    setupFiles: [path.join(import.meta.dirname, 'vitest.setup.ts')],
    // Integration tests share docker containers and fixed ports: run files one at a time.
    fileParallelism: false,
    // Vitest 5 clears mock calls before every test by default; Jest did not, and some tests
    // assert calls made while the module under test was imported (e.g. @Module decorators).
    clearMocks: false,
    testTimeout: 70_000,
    hookTimeout: 120_000,
    reporters: [
      'default',
      ['junit', { outputFile: 'junit.xml', suiteName: process.env.npm_package_name }],
      ['vitest-sonar-reporter', { outputFile: 'test-report.xml' }],
    ],
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.ts'],
      exclude: ['src/**/__test__/**', 'src/index.ts', 'src/**/*.d.ts'],
      reportsDirectory: './coverage',
      reporter: ['html', 'text', 'text-summary', 'cobertura', 'clover', 'json', 'lcov'],
      thresholds: { branches: 100, functions: 100, lines: 100, statements: 100 },
    },
  },
});
