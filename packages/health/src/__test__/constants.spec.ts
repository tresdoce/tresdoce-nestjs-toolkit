import { RequestMethod } from '@nestjs/common';
import { controllersExcludes } from '../health/constants';

describe('healthConstants', () => {
  it('should be return exclude to prefix global', async () => {
    expect(controllersExcludes).toEqual(expect.any(Array));
    expect(controllersExcludes).toMatchObject([
      {
        path: '/health/liveness',
        method: RequestMethod.GET,
      },
      {
        path: '/health/readiness',
        method: RequestMethod.GET,
      },
    ]);
  });
});
