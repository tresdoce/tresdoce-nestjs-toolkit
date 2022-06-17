import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { appConfigBase } from '@tresdoce-nestjs-toolkit/test-utils';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    ...appConfigBase,
    redis: {
      name: 'test-redis-module',
      username: encodeURIComponent('default'),
      password: encodeURIComponent('123456'),
      host: global.hostContainer,
      port: parseInt('6379', 10),
    },
  };
});
