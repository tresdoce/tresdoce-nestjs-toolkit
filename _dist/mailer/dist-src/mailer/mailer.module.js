var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailerModule_1;
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MAILER_OPTIONS } from './constants/mailer.constant';
import { MailerService } from './services/mailer.service';
let MailerModule = MailerModule_1 = class MailerModule {
    static forRoot(options) {
        return {
            global: true,
            module: MailerModule_1,
            providers: [
                MailerService,
                {
                    provide: MAILER_OPTIONS,
                    useValue: options,
                },
            ],
            exports: [MailerService],
        };
    }
};
MailerModule = MailerModule_1 = __decorate([
    Global(),
    Module({
        imports: [ConfigModule],
        providers: [
            MailerService,
            {
                provide: MAILER_OPTIONS,
                useFactory: async (configService) => configService.get('config.mailer'),
                inject: [ConfigService],
            },
        ],
        exports: [MailerService],
    })
], MailerModule);
export { MailerModule };
