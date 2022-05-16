import { RequestMethod } from '@nestjs/common';

export const corePathsExcludes = [
  {
    path: '/health/liveness',
    method: RequestMethod.GET,
  },
  {
    path: '/health/readiness',
    method: RequestMethod.GET,
  },
  {
    path: '/manifest',
    method: RequestMethod.GET,
  },
];
