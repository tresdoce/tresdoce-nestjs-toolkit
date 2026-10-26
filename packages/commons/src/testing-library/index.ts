import type { ViteUserConfig } from 'vitest/config';
import { ignoreDecoratorMetadataCoverage } from './ignore-decorator-metadata-coverage.plugin.js';

export { ignoreDecoratorMetadataCoverage };

export interface IVitestConfigProps {
  /** Minimum coverage (0-100) required for branches, functions, lines and statements. Default: 100. */
  minCoveragePercent?: number;
  /** Extra setup files, resolved from the project root. Default: none. */
  setupFiles?: string[];
  /**
   * Excludes the `_decorate` helpers that Vite's TS transform emits for decorators
   * (`@Injectable()`, `@Controller()`, ...) from coverage, so they are not reported as
   * uncovered branches. Default: true.
   */
  ignoreDecoratorMetadata?: boolean;
}

export const defaultCoverageValue: number = 100;
export const minCoverageValue: number = 0;
export const maxCoverageValue: number = 100;

/**
 * Vitest config for apps built on the NestJS Starter (Nest 12, ESM).
 *
 * @example
 * ```ts
 * // vitest.config.ts
 * import { defineConfig } from 'vitest/config';
 * import { vitestConfig } from '@tresdoce-nestjs-toolkit/commons';
 *
 * export default defineConfig(vitestConfig({ minCoveragePercent: 90 }));
 * ```
 */
export const vitestConfig = ({
  minCoveragePercent = defaultCoverageValue,
  setupFiles = [],
  ignoreDecoratorMetadata = true,
}: IVitestConfigProps = {}): ViteUserConfig => {
  const threshold = Math.min(maxCoverageValue, Math.max(minCoverageValue, minCoveragePercent));

  return {
    plugins: ignoreDecoratorMetadata ? [ignoreDecoratorMetadataCoverage()] : [],
    resolve: { tsconfigPaths: true },
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.{spec,it,test}.ts', 'test/**/*.{spec,e2e-spec}.ts'],
      setupFiles,
      reporters: [
        'default',
        ['junit', { outputFile: 'junit.xml' }],
        ['vitest-sonar-reporter', { outputFile: 'test-report.xml' }],
      ],
      coverage: {
        provider: 'istanbul',
        include: ['src/**/*.ts'],
        exclude: [
          'src/main.ts',
          'src/**/__test__/**',
          'src/**/entities/**',
          'src/**/*.entity.ts',
          'src/**/*.d.ts',
        ],
        reportsDirectory: './coverage',
        reporter: ['html', 'text', 'text-summary', 'cobertura', 'clover', 'json', 'lcov'],
        thresholds: {
          branches: threshold,
          functions: threshold,
          lines: threshold,
          statements: threshold,
        },
      },
    },
  };
};
