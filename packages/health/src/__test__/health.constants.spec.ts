import { RequestMethod } from '@nestjs/common';
import { controllersExcludes } from '../lib/constants/helth.constants';

describe('healthConstants', () => {
  it('should be return exclude to prefix global', async () => {
    expect(controllersExcludes).toEqual(expect.any(Array));
    expect(controllersExcludes).toMatchObject([
      {
        path: '/liveness',
        method: RequestMethod.GET,
      },
      {
        path: '/readiness',
        method: RequestMethod.GET,
      },
    ]);
  });
});
