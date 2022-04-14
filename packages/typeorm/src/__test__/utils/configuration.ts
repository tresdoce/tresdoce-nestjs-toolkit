import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      typeorm: {
        type: process.env.TYPE_ORM_DRIVER || 'mongodb',
        host: global.hostContainer,
        port: parseInt('27017', 10),
        useUnifiedTopology: true,
        // username: encodeURIComponent(process.env.TYPE_ORM_USER),
        // password: encodeURIComponent(process.env.TYPE_ORM_PASSWORD),
        // database: process.env.TYPE_ORM_DB_NAME,
      },
    },
  };
});
