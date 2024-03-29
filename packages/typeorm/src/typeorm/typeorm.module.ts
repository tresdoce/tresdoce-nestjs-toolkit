import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TYPE_ORM_MODULE_OPTIONS } from './constants/typerom.constants';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      useFactory: async (options: TypeOrmModuleOptions) => options,
      inject: [TYPE_ORM_MODULE_OPTIONS],
    }),
  ],
  providers: [
    {
      provide: TYPE_ORM_MODULE_OPTIONS,
      useFactory: async (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('config.database.typeorm'),
      inject: [ConfigService],
    },
  ],
  exports: [TypeOrmModule, TYPE_ORM_MODULE_OPTIONS],
})
export class TypeOrmClientModule {
  static forFeature(features): DynamicModule {
    return TypeOrmModule.forFeature(features);
  }
}
