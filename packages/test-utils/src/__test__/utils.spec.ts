import { delay } from '../utilities';

describe('utilities', () => {
  it('should be return delay default time', async () => {
    jest.spyOn(global, 'setTimeout');
    await delay();
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000);
  });

  it('should be return delay custom time', async () => {
    jest.spyOn(global, 'setTimeout');
    await delay(60);
    expect(setTimeout).toHaveBeenCalledTimes(2);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 60);
  });
});
