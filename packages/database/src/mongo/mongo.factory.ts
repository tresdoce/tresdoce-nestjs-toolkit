import type { ConfigService } from '@nestjs/config';
import type { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import type { MongoModuleOptions } from './interfaces/mongo.interface.js';
import { buildMongoUri } from './utils/mongo-uri.util.js';

export const MONGO_CONFIG_KEY = 'config.database.mongo';

/** Factory usada por `MongoModule` para resolver las opciones de `MongooseModule`. */
export const mongoOptionsFactory = (configService: ConfigService): MongooseModuleFactoryOptions => {
  const options = configService.get<MongoModuleOptions>(MONGO_CONFIG_KEY);
  if (!options) {
    throw new Error(`[MongoModule] Missing '${MONGO_CONFIG_KEY}' configuration`);
  }
  return { ...options.connectionOptions, uri: buildMongoUri(options) };
};
