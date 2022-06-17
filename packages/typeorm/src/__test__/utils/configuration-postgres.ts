import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { appConfigBase } from '@tresdoce-nestjs-toolkit/test-utils';
import { registerAs } from '@nestjs/config';

export default registerAs('config', (): Typings.AppConfig => {
  return {
    ...appConfigBase,
    database: {
      typeorm: {
        type: 'postgres',
        host: global.hostContainer,
        port: parseInt('5432', 10),
        username: encodeURIComponent('root'),
        password: encodeURIComponent('123456'),
        database: encodeURIComponent('test_db'),
        synchronize: true,
        autoLoadEntities: true,
        entities: [__dirname + '/**/post.entity{.ts,.js}'],
      },
    },
  };
});
