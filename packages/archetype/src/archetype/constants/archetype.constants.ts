import { RequestMethod } from '@nestjs/common';

export const CONFIG_OPTIONS = Symbol('CONFIG_OPTIONS');

export const manifestControllerExcludes = [
  {
    path: '/info',
    method: RequestMethod.GET,
  },
];
