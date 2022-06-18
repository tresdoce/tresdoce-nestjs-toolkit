import { RequestMethod } from '@nestjs/common';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
export const HEALTH_MODULE_OPTIONS = 'HEALTH_MODULE_OPTIONS';

export const controllersExcludes = [
  {
    path: '/health/liveness',
    method: RequestMethod.GET,
  },
  {
    path: '/health/readiness',
    method: RequestMethod.GET,
  },
];
