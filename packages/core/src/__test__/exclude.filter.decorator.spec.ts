import { ExcludeFilter, EXCLUDE_FILTER_KEY } from '../index';

describe('ExcludeFilter decorator', () => {
  it('should be defined', async () => {
    expect(ExcludeFilter()).toBeDefined();
  });

  it('should be return key', async () => {
    expect(EXCLUDE_FILTER_KEY).toBe('excludeFilter');
  });
});
