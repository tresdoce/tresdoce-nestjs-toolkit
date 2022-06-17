import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { appConfigBase } from '@tresdoce-nestjs-toolkit/test-utils';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    ...appConfigBase,
    database: {
      typeorm: {
        type: 'mongodb',
        host: global.hostContainer,
        port: parseInt('27017', 10),
        username: encodeURIComponent('root'),
        password: encodeURIComponent('123456'),
        database: encodeURIComponent('test_db'),
        authSource: encodeURIComponent('admin'),
        synchronize: true,
        autoLoadEntities: false,
        entities: [__dirname + '/**/user.entity{.ts,.js}'],
        useUnifiedTopology: true,
      },
    },
  };
});
