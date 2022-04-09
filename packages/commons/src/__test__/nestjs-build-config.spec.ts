import { buildConfig } from '../index';
describe('nestjs-build-config', () => {
  it('should be return jest config is build', () => {
    const config = buildConfig({ output: {}, optimization: {} });
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
  });
  it('should be return jest config not is build', () => {
    const config = buildConfig({ output: {}, optimization: {} });
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
  });
});
