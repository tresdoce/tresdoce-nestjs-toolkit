import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import Axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import _ from 'lodash';
import {
  AXIOS_INSTANCE_TOKEN,
  HTTP_MODULE_ID,
  HTTP_MODULE_OPTIONS,
  defaultConfigInstanceAxios,
  HTTP_MODULE_CONFIG,
  HTTP_MODULE_PROPAGATE_HEADERS,
} from './constants/http.constants';
import { HttpClientService } from './services/httpClient.service';
import {
  HttpModuleAsyncOptions,
  HttpModuleOptions,
  HttpModuleOptionsFactory,
} from './interfaces/http-module.interface';

const createAxiosRetry = (config: HttpModuleOptions = {}) => {
  const axiosInstanceConfig: HttpModuleOptions = _.merge({}, defaultConfigInstanceAxios, config);
  const axiosInstance: AxiosInstance = Axios.create(axiosInstanceConfig);
  axiosRetry(axiosInstance, axiosInstanceConfig);
  return axiosInstance;
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    HttpClientService,
    {
      provide: HTTP_MODULE_CONFIG,
      useFactory: async (configService: ConfigService): Promise<Typings.IHttpClientConfig> =>
        configService.get<Typings.IHttpClientConfig>('config.httpClient') || {},
      inject: [ConfigService],
    },
    {
      provide: HTTP_MODULE_PROPAGATE_HEADERS,
      useFactory: async (httpClient: Typings.IHttpClientConfig): Promise<string[]> =>
        httpClient.propagateHeaders || [],
      inject: [HTTP_MODULE_CONFIG],
    },
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useFactory: async (httpClient: Typings.IHttpClientConfig): Promise<AxiosInstance> =>
        createAxiosRetry(httpClient.httpOptions),
      inject: [HTTP_MODULE_CONFIG],
    },
  ],
  exports: [HttpClientService],
})
export class HttpClientModule {
  static register(config: HttpModuleOptions): DynamicModule {
    return {
      module: HttpClientModule,
      imports: [ConfigModule],
      providers: [
        HttpClientService,
        {
          provide: AXIOS_INSTANCE_TOKEN,
          useValue: createAxiosRetry(config),
        },
        {
          provide: HTTP_MODULE_PROPAGATE_HEADERS,
          useFactory: async (configService: ConfigService): Promise<string[]> =>
            configService.get('config.httpClient.propagateHeaders') || [],
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

  static registerAsync(options: HttpModuleAsyncOptions): DynamicModule {
    return {
      module: HttpClientModule,
      imports: [ConfigModule, ...(options.imports || [])],
      providers: [
        HttpClientService,
        ...this.createAsyncProviders(options),
        {
          provide: AXIOS_INSTANCE_TOKEN,
          useFactory: (config: HttpModuleOptions) => createAxiosRetry(config),
          inject: [HTTP_MODULE_OPTIONS],
        },
        {
          provide: HTTP_MODULE_PROPAGATE_HEADERS,
          useFactory: async (configService: ConfigService): Promise<string[]> =>
            configService.get('config.httpClient.propagateHeaders') || [],
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

  private static createAsyncProviders(options: HttpModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const providers = [this.createAsyncOptionsProvider(options)];

    /* istanbul ignore next */
    if (options.useClass)
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });

    return providers;
  }

  private static createAsyncOptionsProvider(options: HttpModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: HTTP_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    let inject;
    if (options.useExisting) inject = [options.useExisting];
    /* istanbul ignore next */ else if (options.useClass)
      /* istanbul ignore next */
      inject = [options.useClass];

    return {
      provide: HTTP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HttpModuleOptionsFactory) =>
        optionsFactory.createHttpOptions(),
      inject,
    };
  }
}
