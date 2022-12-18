import { Public, IS_PUBLIC_KEY } from '../index';

describe('Public decorator', () => {
  it('should be defined', async () => {
    expect(Public()).toBeDefined();
  });

  it('should be return key', async () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
