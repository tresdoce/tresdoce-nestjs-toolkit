var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DynamooseModule_1;
import { flatten, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseCoreModule } from './dynamoose-core.module';
import { createDynamooseAsyncProviders, createDynamooseProviders, } from './providers/dynamoose.provider';
import { DYNAMOOSE_OPTIONS } from './constants/dynamoose.constant';
let DynamooseModule = DynamooseModule_1 = class DynamooseModule {
    static forRoot(options = {}) {
        return {
            module: DynamooseModule_1,
            imports: [DynamooseCoreModule.forRoot(options)],
        };
    }
    static forRootAsync(options) {
        return {
            module: DynamooseModule_1,
            imports: [DynamooseCoreModule.forRootAsync(options)],
        };
    }
    static forFeature(models = []) {
        const providers = createDynamooseProviders(models);
        return {
            module: DynamooseModule_1,
            providers: providers,
            exports: providers,
        };
    }
    static forFeatureAsync(factories = []) {
        const providers = createDynamooseAsyncProviders(factories);
        const imports = factories.map((factory) => factory.imports || []);
        const uniqImports = new Set(flatten(imports));
        return {
            module: DynamooseModule_1,
            imports: [...uniqImports],
            providers: providers,
            exports: providers,
        };
    }
};
DynamooseModule = DynamooseModule_1 = __decorate([
    Global(),
    Module({
        imports: [
            ConfigModule,
            DynamooseCoreModule.forRootAsync({
                useFactory: async (options) => options,
                inject: [DYNAMOOSE_OPTIONS],
            }),
        ],
        providers: [
            {
                provide: DYNAMOOSE_OPTIONS,
                useFactory: async (configService) => configService.get('config.dynamodb'),
                inject: [ConfigService],
            },
        ],
        exports: [DynamooseCoreModule, DYNAMOOSE_OPTIONS],
    })
], DynamooseModule);
export { DynamooseModule };
