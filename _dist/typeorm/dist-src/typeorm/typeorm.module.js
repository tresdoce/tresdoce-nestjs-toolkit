var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TYPE_ORM_MODULE_OPTIONS } from './constants/typerom.constants';
let TypeOrmClientModule = class TypeOrmClientModule {
    static forFeature(features) {
        return TypeOrmModule.forFeature(features);
    }
};
TypeOrmClientModule = __decorate([
    Global(),
    Module({
        imports: [
            ConfigModule,
            TypeOrmModule.forRootAsync({
                useFactory: async (options) => options,
                inject: [TYPE_ORM_MODULE_OPTIONS],
            }),
        ],
        providers: [
            {
                provide: TYPE_ORM_MODULE_OPTIONS,
                useFactory: async (configService) => configService.get('config.database.typeorm'),
                inject: [ConfigService],
            },
        ],
        exports: [TypeOrmModule, TYPE_ORM_MODULE_OPTIONS],
    })
], TypeOrmClientModule);
export { TypeOrmClientModule };
