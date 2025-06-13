var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpClientModule_1;
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import Axios from 'axios';
import axiosRetry from 'axios-retry';
import _ from 'lodash';
import { AXIOS_INSTANCE_TOKEN, HTTP_MODULE_ID, HTTP_MODULE_OPTIONS, defaultConfigInstanceAxios, HTTP_MODULE_CONFIG, HTTP_MODULE_PROPAGATE_HEADERS, } from './constants/http.constants';
import { HttpClientService } from './services/httpClient.service';
const createAxiosRetry = (config = {}) => {
    const axiosInstanceConfig = _.merge({}, defaultConfigInstanceAxios, config);
    const axiosInstance = Axios.create(axiosInstanceConfig);
    axiosRetry(axiosInstance, axiosInstanceConfig);
    return axiosInstance;
};
let HttpClientModule = HttpClientModule_1 = class HttpClientModule {
    static register(config) {
        return {
            module: HttpClientModule_1,
            imports: [ConfigModule],
            providers: [
                HttpClientService,
                {
                    provide: AXIOS_INSTANCE_TOKEN,
                    useValue: createAxiosRetry(config),
                },
                {
                    provide: HTTP_MODULE_PROPAGATE_HEADERS,
                    useFactory: async (configService) => configService.get('config.httpClient.propagateHeaders') || [],
                    inject: [ConfigService],
                },
                {
                    provide: HTTP_MODULE_ID,
                    useValue: randomStringGenerator(),
                },
            ],
            exports: [HttpClientService],
        };
    }
    static registerAsync(options) {
        return {
            module: HttpClientModule_1,
            imports: [ConfigModule, ...(options.imports || [])],
            providers: [
                HttpClientService,
                ...this.createAsyncProviders(options),
                {
                    provide: AXIOS_INSTANCE_TOKEN,
                    useFactory: (config) => createAxiosRetry(config),
                    inject: [HTTP_MODULE_OPTIONS],
                },
                {
                    provide: HTTP_MODULE_PROPAGATE_HEADERS,
                    useFactory: async (configService) => configService.get('config.httpClient.propagateHeaders') || [],
                    inject: [ConfigService],
                },
                {
                    provide: HTTP_MODULE_ID,
                    useValue: randomStringGenerator(),
                },
                ...(options.extraProviders || []),
            ],
            exports: [HttpClientService],
        };
    }
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        const providers = [this.createAsyncOptionsProvider(options)];
        if (options.useClass)
            providers.push({
                provide: options.useClass,
                useClass: options.useClass,
            });
        return providers;
    }
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: HTTP_MODULE_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        let inject;
        if (options.useExisting)
            inject = [options.useExisting];
        else if (options.useClass)
            inject = [options.useClass];
        return {
            provide: HTTP_MODULE_OPTIONS,
            useFactory: async (optionsFactory) => optionsFactory.createHttpOptions(),
            inject,
        };
    }
};
HttpClientModule = HttpClientModule_1 = __decorate([
    Global(),
    Module({
        imports: [ConfigModule],
        providers: [
            HttpClientService,
            {
                provide: HTTP_MODULE_CONFIG,
                useFactory: async (configService) => configService.get('config.httpClient') || {},
                inject: [ConfigService],
            },
            {
                provide: HTTP_MODULE_PROPAGATE_HEADERS,
                useFactory: async (httpClient) => httpClient.propagateHeaders || [],
                inject: [HTTP_MODULE_CONFIG],
            },
            {
                provide: AXIOS_INSTANCE_TOKEN,
                useFactory: async (httpClient) => createAxiosRetry(httpClient.httpOptions),
                inject: [HTTP_MODULE_CONFIG],
            },
        ],
        exports: [HttpClientService],
    })
], HttpClientModule);
export { HttpClientModule };
