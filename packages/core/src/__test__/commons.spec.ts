import { corePathsExcludes } from '../index';
import { RequestMethod } from '@nestjs/common';

describe('commons', () => {
  it('should be return commons exclude paths', () => {
    expect(corePathsExcludes).not.toBe(null);
    expect(corePathsExcludes).toBeDefined();
    expect(corePathsExcludes).toBeInstanceOf(Array);

    expect(corePathsExcludes).toContainObject({
      path: '/health/liveness',
      method: RequestMethod.GET,
    });

    expect(corePathsExcludes).toContainObject({
      path: '/health/readiness',
      method: RequestMethod.GET,
    });

    expect(corePathsExcludes).toContainObject({
      path: '/manifest',
      method: RequestMethod.GET,
    });
  });
});
