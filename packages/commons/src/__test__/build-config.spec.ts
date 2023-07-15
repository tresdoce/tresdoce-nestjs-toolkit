import { buildConfig } from '../index';
describe('build-config', () => {
  const INIT_ENVS = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...INIT_ENVS };
  });

  afterAll(() => {
    process.env = INIT_ENVS;
  });

  it('should be return webpack config not is build', () => {
    process.env.NODE_ENV = 'dev';
    const config = buildConfig({ output: {}, optimization: {} }, {});
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('development');
    expect(config.optimization.nodeEnv).toBeFalsy();
  });

  it('should be return webpack config is build', () => {
    process.env.NODE_ENV = 'build';
    const config = buildConfig({ output: {}, optimization: {} }, {});
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('production');
    expect(config.optimization.nodeEnv).toEqual('production');
  });
});
