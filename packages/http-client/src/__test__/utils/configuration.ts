import { registerAs } from '@nestjs/config';
import { appConfigBase } from '@tresdoce-nestjs-toolkit/test-utils';

export default registerAs('config', () => {
  return {
    ...appConfigBase,
    httOptions: {
      timeout: 5000,
      maxRedirects: 5,
    },
  };
});
