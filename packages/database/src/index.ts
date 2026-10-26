export { MongoModule } from './mongo/mongo.module.js';
export { mongoOptionsFactory, MONGO_CONFIG_KEY } from './mongo/mongo.factory.js';
export { buildMongoUri, encodeUriComponent } from './mongo/utils/mongo-uri.util.js';
export type { MongoModuleOptions, MongoUriParam } from './mongo/interfaces/mongo.interface.js';
export {
  InjectConnection,
  InjectModel,
  Prop,
  SchemaFactory,
  getConnectionToken,
  getModelToken,
} from '@nestjs/mongoose';
export type { ModelDefinition } from '@nestjs/mongoose';
// mongoose es CommonJS: `export *` solo re-exporta los named exports que Node detecta
// (no incluye `connection`, `models`, `plugins`, ...). La instancia completa queda como `mongoose`.
export * from 'mongoose';
export { default as mongoose } from 'mongoose';
