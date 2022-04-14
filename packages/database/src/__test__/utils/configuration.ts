import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      mongo: {
        connection: 'mongodb',
        host: global.hostContainer,
        port: parseInt('27017', 10),
        //user: encodeURIComponent('root'),
        //password: encodeURIComponent('pass123'),
        //dbName: 'testDb'
      },
    },
  };
});
