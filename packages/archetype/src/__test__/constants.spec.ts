import { RequestMethod } from '@nestjs/common';
import { manifestControllerExcludes } from '../archetype/constants/archetype.constants';

describe('healthConstants', () => {
  it('should be return exclude to prefix global', async () => {
    expect(manifestControllerExcludes).toEqual(expect.any(Array));
    expect(manifestControllerExcludes).toMatchObject([
      {
        path: '/manifest',
        method: RequestMethod.GET,
      },
    ]);
  });
});
