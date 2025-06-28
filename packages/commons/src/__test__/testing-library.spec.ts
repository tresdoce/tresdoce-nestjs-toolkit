import { jestConfig, maxCoverageValue, minCoverageValue } from '../index';

describe('testing-library', () => {
  it('should be return jest config default', () => {
    const config = jestConfig();
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.coverageThreshold.global).toHaveProperty('branches', minCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('functions', minCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('lines', minCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('statements', minCoverageValue);
  });

  it('should be return jest config with min coverage value', () => {
    const valueCoverage = 90;
    const config = jestConfig({ minCoveragePercent: valueCoverage });
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.coverageThreshold.global).toHaveProperty('branches', valueCoverage);
    expect(config.coverageThreshold.global).toHaveProperty('functions', valueCoverage);
    expect(config.coverageThreshold.global).toHaveProperty('lines', valueCoverage);
    expect(config.coverageThreshold.global).toHaveProperty('statements', valueCoverage);
  });

  it(`should be return jest config with min coverage value when minCoveragePercent is less than ${minCoverageValue}`, () => {
    const valueCoverage = 0;
    const config = jestConfig({ minCoveragePercent: valueCoverage });
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.coverageThreshold.global).toHaveProperty('branches', minCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('functions', minCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('lines', minCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('statements', minCoverageValue);
  });

  it(`should be return jest config with max coverage value when minCoveragePercent is greater than ${maxCoverageValue}`, () => {
    const valueCoverage = 150;
    const config = jestConfig({ minCoveragePercent: valueCoverage });

    expect(config).not.toBeNull();
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.coverageThreshold.global).toHaveProperty('branches', maxCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('functions', maxCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('lines', maxCoverageValue);
    expect(config.coverageThreshold.global).toHaveProperty('statements', maxCoverageValue);
  });
});
