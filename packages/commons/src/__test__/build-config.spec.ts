import { buildConfig } from '../index';
describe('build-config', () => {
  it('should be return jest config is build', () => {
    const config = buildConfig({ output: {}, optimization: {} }, true);
    console.log(config);
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('production');
  });

  it('should be return jest config not is build', () => {
    const config = buildConfig({ output: {}, optimization: {} });
    console.log(config);
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
    expect(config.mode).toEqual('none');
  });
});
