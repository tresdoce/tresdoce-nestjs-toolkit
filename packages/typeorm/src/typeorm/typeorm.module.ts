import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';

import { TYPE_ORM_MODULE_OPTIONS } from './constants/typeorm.constants.js';

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
  /**
   * Registra los repositorios de las entidades indicadas en el scope del módulo.
   * Delegado de `TypeOrmModule.forFeature` de `@nestjs/typeorm`.
   */
  static forFeature(
    entities?: Parameters<typeof TypeOrmModule.forFeature>[0],
    dataSource?: Parameters<typeof TypeOrmModule.forFeature>[1],
  ): DynamicModule {
    return TypeOrmModule.forFeature(entities, dataSource);
  }
}
