import { RequestMethod } from '@nestjs/common';

export const CONFIG_OPTIONS = 'CONFIG_OPTIONS';

export const manifestControllerExcludes = [
  {
    path: '/manifest',
    method: RequestMethod.GET,
  },
];
