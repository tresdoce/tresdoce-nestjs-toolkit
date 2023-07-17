import { buildConfig } from '../index';
import { Configuration } from '@nestjs/cli/lib/configuration';

describe('build-config', () => {
  const INIT_ENVS = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...INIT_ENVS };
  });

  afterAll(() => {
    process.env = INIT_ENVS;
  });

  it('should return the development configuration when NODE_ENV is not "build"', () => {
    process.env.NODE_ENV = 'dev';
    const config = buildConfig() as unknown as Configuration;
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('development');
    expect(config.optimization.nodeEnv).toBeFalsy();
  });

  it('should return the production configuration when NODE_ENV is "build"', () => {
    process.env.NODE_ENV = 'build';
    const config = buildConfig() as unknown as Configuration;
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('production');
    expect(config.optimization.nodeEnv).toEqual('production');
  });

  it('should merge with the additional config', () => {
    const additionalConfig = { devtool: 'eval' };
    const config = buildConfig(additionalConfig) as unknown as Configuration;
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('development');
    expect(config.devtool).toEqual('eval');
    expect(config.optimization.nodeEnv).toBeFalsy();
  });
});
