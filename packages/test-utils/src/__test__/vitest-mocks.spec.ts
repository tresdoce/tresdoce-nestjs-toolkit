import { appConfigBase, JestFN, VitestFN } from '../index.js';

describe('VitestFN', () => {
  it('should return a config mock that resolves the base app config', () => {
    const configMock = VitestFN.config();
    expect(vi.isMockFunction(configMock)).toBe(true);
    expect(configMock()).toEqual(appConfigBase);
  });

  it('should return a chainable execution context mock', () => {
    const context = VitestFN.executionContext();
    expect(context.switchToHttp().getRequest()).toBe(context);
    expect(vi.isMockFunction(context.getHandler)).toBe(true);
  });

  it('should keep JestFN as a deprecated alias', () => {
    expect(JestFN).toBe(VitestFN);
  });
});
