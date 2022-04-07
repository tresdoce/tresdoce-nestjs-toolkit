import { RequestMethod } from '@nestjs/common';

export const commonsControllersExcludes = [
  {
    path: '/health/live',
    method: RequestMethod.GET,
  },
  {
    path: '/health/ready',
    method: RequestMethod.GET,
  },
  {
    path: '/manifest',
    method: RequestMethod.GET,
  },
];
