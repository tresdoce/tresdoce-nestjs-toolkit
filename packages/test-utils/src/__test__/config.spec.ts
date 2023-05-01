import { config, dynamicConfig } from '../config/index';
import { appConfigBase } from '../fixtures';

describe('Config', () => {
  describe('baseConfig', () => {
    it('should be return config', async () => {
      expect(config()).toBeDefined();
      expect(config()).not.toBe(null);
      expect(typeof config()).toBe('object');
      expect(config()).toEqual(appConfigBase);
    });
  });

  describe('dynamicConfig', () => {
    it('should be return config with args', async () => {
      const args = {
        httOptions: {
          timeout: 5000,
          maxRedirects: 5,
        },
      };

      expect(dynamicConfig(args)()).toBeDefined();
      expect(dynamicConfig(args)()).not.toBe(null);
      expect(typeof dynamicConfig(args)()).toBe('object');
      expect(dynamicConfig(args)()).toEqual({ ...appConfigBase, ...args });
    });

    it('should be return config without args', async () => {
      expect(dynamicConfig()()).toBeDefined();
      expect(dynamicConfig()()).not.toBe(null);
      expect(typeof dynamicConfig()()).toBe('object');
      expect(dynamicConfig()()).toEqual(appConfigBase);
    });
  });
});
