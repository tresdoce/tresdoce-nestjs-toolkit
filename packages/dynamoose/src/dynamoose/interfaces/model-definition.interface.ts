import { ModelTableOptions } from 'dynamoose/dist/Model/index.js';
import { Schema, SchemaDefinition } from 'dynamoose/dist/Schema.js';
import { SerializerOptions } from 'dynamoose/dist/Serializer.js';

export type ModelDefinition = {
  name: string;
  schema: Schema | SchemaDefinition | (Schema | SchemaDefinition)[];
  options?: ModelTableOptions;
  serializers?: { [key: string]: SerializerOptions };
};
