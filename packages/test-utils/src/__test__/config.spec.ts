import { config } from '../config/index';
import { appConfigBase } from '../fixtures/index';

describe('config', () => {
  it('should be return config', async () => {
    expect(config()).toBeDefined();
    expect(config()).not.toBe(null);
    expect(typeof config()).toBe('object');
    expect(config()).toEqual(appConfigBase);
  });
});
