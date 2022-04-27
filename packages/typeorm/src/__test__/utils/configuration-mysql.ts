import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      typeorm: {
        type: 'mysql',
        host: global.hostContainer,
        port: parseInt('3306', 10),
        username: encodeURIComponent('root'),
        password: encodeURIComponent('123456'),
        database: encodeURIComponent('test_db'),
        synchronize: false,
        autoLoadEntities: false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      },
    },
  };
});
