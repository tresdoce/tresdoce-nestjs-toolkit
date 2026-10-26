import { Public, IS_PUBLIC_KEY } from '../index.js';

describe('Public decorator', () => {
  it('should be defined', async () => {
    expect(Public()).toBeDefined();
  });

  it('should be return key', async () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
