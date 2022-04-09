import { eslintConfig } from '../index';
describe('eslint-config', () => {
  it('should be return jest config', () => {
    const config = eslintConfig();
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
  });
});
