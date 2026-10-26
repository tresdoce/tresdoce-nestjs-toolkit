import { DynamicModule, Module, Provider, Global, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import _ from 'lodash';
import {
  AXIOS_INSTANCE_TOKEN,
  HTTP_MODULE_OPTIONS,
  defaultConfigInstanceAxios,
  HTTP_MODULE_CONFIG,
  HTTP_MODULE_PROPAGATE_HEADERS,
} from './constants/http.constants.js';
import { HttpClientService } from './services/httpClient.service.js';
import type {
  HttpClientConfig,
  HttpModuleAsyncOptions,
  HttpModuleOptions,
  HttpModuleOptionsFactory,
} from './interfaces/http-module.interface.js';

const createAxiosRetry = (config: HttpModuleOptions = {}) => {
  const axiosInstanceConfig: HttpModuleOptions = _.merge({}, defaultConfigInstanceAxios, config);
  const axiosInstance: AxiosInstance = Axios.create(axiosInstanceConfig);
  // Axios exposes separate ESM and CommonJS declarations. With TypeScript 6,
  // axios-retry can resolve the other declaration even though both types
  // describe the same runtime instance.
  axiosRetry(axiosInstance as Parameters<typeof axiosRetry>[0], axiosInstanceConfig);
  return axiosInstance;
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    HttpClientService,
    {
      provide: HTTP_MODULE_CONFIG,
      useFactory: (configService: ConfigService): HttpClientConfig =>
        configService.get<HttpClientConfig>('config.httpClient') || {},
      inject: [ConfigService],
    },
    {
      provide: HTTP_MODULE_PROPAGATE_HEADERS,
      useFactory: (httpClient: HttpClientConfig): string[] => httpClient.propagateHeaders || [],
      inject: [HTTP_MODULE_CONFIG],
    },
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useFactory: (httpClient: HttpClientConfig): AxiosInstance =>
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
        ...(options.extraProviders || []),
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
      ],
      exports: [HttpClientService],
    };
  }

  private static createAsyncProviders(options: HttpModuleAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const providers: Provider<any>[] = [this.createAsyncOptionsProvider(options)];

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

    let inject: Type<HttpModuleOptionsFactory>[];
    if (options.useExisting !== undefined) {
      inject = [options.useExisting];
    }

    if (options.useClass !== undefined && !inject) {
      inject = [options.useClass];
    }

    return {
      provide: HTTP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HttpModuleOptionsFactory): Promise<HttpModuleOptions> =>
        optionsFactory.createHttpOptions(),
      inject,
    };
  }
}
