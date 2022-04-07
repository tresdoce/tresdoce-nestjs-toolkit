import { commonsControllersExcludes } from '../index';
import { RequestMethod } from '@nestjs/common';

describe('commons', () => {
  it('should be return commons exclude paths', () => {
    expect(commonsControllersExcludes).not.toBe(null);
    expect(commonsControllersExcludes).toBeDefined();
    expect(commonsControllersExcludes).toBeInstanceOf(Array);

    expect(commonsControllersExcludes).toContainObject({
      path: '/health/live',
      method: RequestMethod.GET,
    });

    expect(commonsControllersExcludes).toContainObject({
      path: '/health/ready',
      method: RequestMethod.GET,
    });

    expect(commonsControllersExcludes).toContainObject({
      path: '/manifest',
      method: RequestMethod.GET,
    });
  });
});
