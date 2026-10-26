import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import type { ModelDefinition } from '@nestjs/mongoose';
import { mongoOptionsFactory } from './mongo.factory.js';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mongoOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class MongoModule {
  static forFeature(features: ModelDefinition[]): DynamicModule {
    return MongooseModule.forFeature(features);
  }
}
