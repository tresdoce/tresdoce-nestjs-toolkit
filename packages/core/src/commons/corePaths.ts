import { RequestMethod } from '@nestjs/common';

export const corePathsExcludes = () => {
  const apiContext = process.env.CONTEXT ? `/${process.env.CONTEXT}` : '';

  return [
    {
      path: `${apiContext}/health/liveness`,
      method: RequestMethod.GET,
    },
    {
      path: `${apiContext}/health/readiness`,
      method: RequestMethod.GET,
    },
    {
      path: `${apiContext}/info`,
      method: RequestMethod.GET,
    },
  ];
};

export const excludePaths = () => corePathsExcludes().map((item) => item.path);
