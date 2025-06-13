var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ElkModule_1;
import { Global, Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FormatService, RedactModule, RedactService, } from '@tresdoce-nestjs-toolkit/utils';
import { Client } from '@elastic/elasticsearch';
import _ from 'lodash';
import { ELK_MODULE_OPTIONS, ELK_CLIENT, ELK_MODULE_CLIENT_OPTIONS, ELK_OMITS_IN_OPTIONS, } from './constants/elk.constant';
import { createElkClient } from './providers/elk-client.provider';
import { ElkService } from './services/elk.service';
let ElkModule = ElkModule_1 = class ElkModule {
    constructor(options, elkClient) {
        this.options = options;
        this.elkClient = elkClient;
    }
    static register(options) {
        return {
            global: true,
            module: ElkModule_1,
            imports: [
                RedactModule.registerAsync({
                    useFactory: (options) => options?.redact || {},
                    inject: [ELK_MODULE_OPTIONS],
                }),
            ],
            providers: [
                createElkClient(),
                ElkService,
                RedactService,
                FormatService,
                {
                    provide: ELK_MODULE_OPTIONS,
                    useValue: options,
                },
                {
                    provide: ELK_MODULE_CLIENT_OPTIONS,
                    useFactory: (options) => _.omit(options, ELK_OMITS_IN_OPTIONS),
                    inject: [ELK_MODULE_OPTIONS],
                },
            ],
            exports: [ELK_MODULE_OPTIONS, ELK_CLIENT, ElkService],
        };
    }
    async onModuleDestroy() {
        await this.elkClient.close();
    }
};
ElkModule = ElkModule_1 = __decorate([
    Global(),
    Module({
        imports: [
            ConfigModule,
            RedactModule.registerAsync({
                useFactory: (options) => options?.redact || {},
                inject: [ELK_MODULE_OPTIONS],
            }),
        ],
        providers: [
            createElkClient(),
            ElkService,
            RedactService,
            FormatService,
            {
                provide: ELK_MODULE_OPTIONS,
                useFactory: async (configService) => configService.get('config.elasticsearch'),
                inject: [ConfigService],
            },
            {
                provide: ELK_MODULE_CLIENT_OPTIONS,
                useFactory: (options) => _.omit(options, ELK_OMITS_IN_OPTIONS),
                inject: [ELK_MODULE_OPTIONS],
            },
        ],
        exports: [ELK_MODULE_OPTIONS, ELK_CLIENT, ElkService],
    }),
    __param(0, Inject(ELK_MODULE_OPTIONS)),
    __param(1, Inject(ELK_CLIENT)),
    __metadata("design:paramtypes", [Object, Client])
], ElkModule);
export { ElkModule };
