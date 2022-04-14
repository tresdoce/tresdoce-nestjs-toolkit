import { RequestMethod } from '@nestjs/common';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const controllersExcludes = [
  {
    path: '/liveness',
    method: RequestMethod.GET,
  },
  {
    path: '/readiness',
    method: RequestMethod.GET,
  },
];
