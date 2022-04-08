import { corePathsExcludes } from '../index';
import { RequestMethod } from '@nestjs/common';

describe('commons', () => {
  it('should be return commons exclude paths', () => {
    expect(corePathsExcludes).not.toBe(null);
    expect(corePathsExcludes).toBeDefined();
    expect(corePathsExcludes).toBeInstanceOf(Array);

    expect(corePathsExcludes).toContainObject({
      path: '/health/live',
      method: RequestMethod.GET,
    });

    expect(corePathsExcludes).toContainObject({
      path: '/health/ready',
      method: RequestMethod.GET,
    });

    expect(corePathsExcludes).toContainObject({
      path: '/manifest',
      method: RequestMethod.GET,
    });
  });
});
