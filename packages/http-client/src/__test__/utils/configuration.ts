import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    httOptions: {
      timeout: 5000,
      maxRedirects: 5,
    },
  };
});
