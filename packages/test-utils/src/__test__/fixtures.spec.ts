import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { appConfigBase, manifest } from '../fixtures/index';

describe('Fixture - appConfigBase', () => {
  it('should be return appBaseConfig', async () => {
    expect(appConfigBase).toBeDefined();
    expect(appConfigBase).not.toBe(null);
    expect(typeof appConfigBase).toBe('object');
  });
});

describe('Fixture - manifest', () => {
  it('should be return appBaseConfig', async () => {
    expect(manifest).toBeDefined();
    expect(manifest).not.toBe(null);
    expect(typeof manifest).toBe('object');
  });
});
