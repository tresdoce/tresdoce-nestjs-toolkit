var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG_MODULE_OPTIONS } from './constants/camunda.constants';
import { CamundaTaskConnector } from './providers/camunda.provider';
let CamundaModule = class CamundaModule {
};
CamundaModule = __decorate([
    Global(),
    Module({
        imports: [ConfigModule],
        providers: [
            CamundaTaskConnector,
            {
                provide: CONFIG_MODULE_OPTIONS,
                useFactory: async (configService) => configService.get('config.camunda'),
                inject: [ConfigService],
            },
        ],
        exports: [],
    })
], CamundaModule);
export { CamundaModule };
