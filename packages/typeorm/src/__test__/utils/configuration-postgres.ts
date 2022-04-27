import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      typeorm: {
        type: 'postgres',
        host: global.hostContainer,
        port: parseInt('5432', 10),
        username: encodeURIComponent('root'),
        password: encodeURIComponent('123456'),
        database: encodeURIComponent('test_db'),
        synchronize: false,
        autoLoadEntities: false,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        options: {
          encrypt: false,
        },
        useUnifiedTopology: true,
      },
    },
  };
});
