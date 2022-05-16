import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      typeorm: {
        type: 'mongodb',
        host: 'localhost',
        port: parseInt('27017', 10),
        username: encodeURIComponent('root'),
        password: encodeURIComponent('123456'),
        database: encodeURIComponent('test_db'),
        authSource: 'admin',
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
