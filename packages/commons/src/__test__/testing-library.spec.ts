import { jestConfig } from '../index';
describe('testing-library', () => {
  it('should be return jest config', () => {
    const config = jestConfig();
    expect(config).not.toBe(null);
    expect(typeof config).toBe('object');
    expect(config).toBeDefined();
  });
});
