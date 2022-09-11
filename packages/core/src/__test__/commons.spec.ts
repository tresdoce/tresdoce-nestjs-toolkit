import { corePathsExcludes } from '../index';
import { RequestMethod } from '@nestjs/common';

describe('commons', () => {
  it('should be return commons exclude paths', () => {
    expect(corePathsExcludes).not.toBe(null);
    expect(corePathsExcludes).toBeDefined();
    expect(corePathsExcludes).toBeInstanceOf(Array);

    expect(corePathsExcludes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/health/liveness',
          method: RequestMethod.GET,
        }),
      ]),
    );

    expect(corePathsExcludes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/health/readiness',
          method: RequestMethod.GET,
        }),
      ]),
    );

    expect(corePathsExcludes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/manifest',
          method: RequestMethod.GET,
        }),
      ]),
    );
  });
});
