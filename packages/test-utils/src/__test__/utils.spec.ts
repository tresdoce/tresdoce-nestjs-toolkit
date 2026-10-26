import { delay, pathJoin } from '../utilities/index.js';
import path from 'path';

describe('utilities', () => {
  it('should be return delay default time', async () => {
    vi.spyOn(global, 'setTimeout');
    await delay();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000);
  });

  it('should be return delay custom time', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    await delay(60);
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60);
    setTimeoutSpy.mockRestore();
  });

  it('should be return a join of paths', async () => {
    const filePath = pathJoin(import.meta.dirname, 'join');
    expect(filePath).toBe(path.join(import.meta.dirname, 'join'));
  });
});
