import { RequestMethod } from '@nestjs/common';
import { controllersExcludes } from '@tresdoce-nestjs-toolkit/health';

export const corePathsExcludes = [
  ...controllersExcludes,
  {
    path: '/manifest',
    method: RequestMethod.GET,
  },
];
