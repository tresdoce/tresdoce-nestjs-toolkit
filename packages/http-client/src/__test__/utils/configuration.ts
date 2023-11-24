import { registerAs } from '@nestjs/config';
import { appConfigBase } from '@tresdoce-nestjs-toolkit/test-utils';

export default registerAs('config', () => {
  return {
    ...appConfigBase,
    httpClient: {
      httpOptions: {
        timeout: 5000,
        maxRedirects: 5,
      },
      propagateHeaders: ['x-custom-header', 'x-custom-header-propagate'],
    },
  };
});
