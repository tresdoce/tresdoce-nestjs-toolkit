var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { LivenessController } from './controllers/liveness.controller';
import { ReadinessController } from './controllers/readiness.controller';
import { CONFIG_OPTIONS } from './constants';
let HealthModule = class HealthModule {
};
HealthModule = __decorate([
    Global(),
    Module({
        imports: [ConfigModule, TerminusModule, HttpModule],
        controllers: [LivenessController, ReadinessController],
        exports: [LivenessController, ReadinessController],
        providers: [
            LivenessController,
            ReadinessController,
            {
                provide: CONFIG_OPTIONS,
                useFactory: async (configService) => configService.get('config'),
                inject: [ConfigService],
            },
        ],
    })
], HealthModule);
export { HealthModule };
