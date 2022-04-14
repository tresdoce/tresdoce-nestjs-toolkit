import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    server: {
      isProd: false,
      logLevel: 'trace',
    },
    httpConfig: {
      aditionalPropagateHeaders: '',
      httOptions: {
        timeout: 5000,
        maxRedirects: 5,
      },
    },
  };
});
