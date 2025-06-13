var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedactModule_1;
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDACT_MODULE_OPTIONS, REDACT_PROVIDER } from './constants/redact.constant';
import { redactProvider } from './providers/redact.provider';
import { RedactService } from './services/redact.service';
let RedactModule = RedactModule_1 = class RedactModule {
    static register(_options) {
        return {
            global: true,
            module: RedactModule_1,
            providers: [
                redactProvider(),
                RedactService,
                {
                    provide: REDACT_MODULE_OPTIONS,
                    useValue: _options,
                },
            ],
            exports: [REDACT_PROVIDER, RedactService],
        };
    }
    static registerAsync(_options) {
        return {
            global: true,
            module: RedactModule_1,
            imports: _options.imports,
            providers: [redactProvider(), RedactService, ...this.createAsyncProviders(_options)],
            exports: [REDACT_PROVIDER, RedactService],
        };
    }
    static createAsyncProviders(_options) {
        if (_options.useFactory) {
            return [this.createAsyncOptionsProvider(_options)];
        }
        return [
            this.createAsyncOptionsProvider(_options),
            {
                provide: _options.useClass,
                useClass: _options.useClass,
            },
        ];
    }
    static createAsyncOptionsProvider(_options) {
        if (_options.useFactory) {
            return {
                provide: REDACT_MODULE_OPTIONS,
                useFactory: _options.useFactory,
                inject: _options.inject || [],
            };
        }
        return {
            provide: REDACT_MODULE_OPTIONS,
            useFactory: async (_optionsFactory) => _optionsFactory.createRedactOptions(),
            inject: [_options.useClass],
        };
    }
};
RedactModule = RedactModule_1 = __decorate([
    Global(),
    Module({
        imports: [ConfigModule],
        providers: [
            redactProvider(),
            RedactService,
            {
                provide: REDACT_MODULE_OPTIONS,
                useFactory: async (_configService) => _configService.get('config.redact') || null,
                inject: [ConfigService],
            },
        ],
        exports: [REDACT_PROVIDER, RedactService],
    })
], RedactModule);
export { RedactModule };
