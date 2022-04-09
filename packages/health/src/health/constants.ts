import { RequestMethod } from '@nestjs/common';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const controllersExcludes = [
  {
    path: '/health/live',
    method: RequestMethod.GET,
  },
  {
    path: '/health/ready',
    method: RequestMethod.GET,
  },
];
