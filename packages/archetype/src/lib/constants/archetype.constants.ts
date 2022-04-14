import { RequestMethod } from '@nestjs/common';

export const manifestControllerExcludes = [
  {
    path: '/manifest',
    method: RequestMethod.GET,
  },
];
