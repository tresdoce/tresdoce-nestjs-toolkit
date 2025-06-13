var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BcryptService } from './services/bcrypt.service';
import { BCRYPT_DEFAULT_OPTIONS, BCRYPT_MODULE_OPTIONS } from './constants/bcrypt.constant';
let BcryptModule = class BcryptModule {
};
BcryptModule = __decorate([
    Global(),
    Module({
        providers: [
            BcryptService,
            {
                provide: BCRYPT_MODULE_OPTIONS,
                useFactory: async (_configService) => ({
                    ...BCRYPT_DEFAULT_OPTIONS,
                    ..._configService.get('config.bcrypt'),
                }),
                inject: [ConfigService],
            },
        ],
        exports: [BcryptService],
    })
], BcryptModule);
export { BcryptModule };
