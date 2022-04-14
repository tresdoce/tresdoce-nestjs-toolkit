import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Typings } from '@tresdoce-nestjs-toolkit/core';
import { LoggingModule } from '@tresdoce-nestjs-toolkit/logging';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import Axios from 'axios';
import axiosRetry from 'axios-retry';
import * as _ from 'lodash';
import {
  AXIOS_INSTANCE_TOKEN,
  HTTP_MODULE_OPTIONS,
  HTTP_MODULE_ID,
  HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS,
} from './constants/http.constants';
import {
  HttpModuleAsyncOptions,
  HttpModuleOptions,
  HttpModuleOptionsFactory,
} from './interfaces/http-module.interface';
import { defaultConfigInstanceAxios } from './constants/http.constants';
import { HttpClientService } from './services/http.service';

const createAxiosRetry = (config: HttpModuleOptions) => {
  const axiosInstanceConfig: HttpModuleOptions = {
    ..._.merge(defaultConfigInstanceAxios, config),
  };
  const axiosInstance = Axios.create(axiosInstanceConfig);
  axiosRetry(axiosInstance, axiosInstanceConfig);
  return axiosInstance;
};

@Global()
@Module({
  imports: [ConfigModule, LoggingModule],
  providers: [
    HttpClientService,
    {
      provide: HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS,
      useFactory: async (configService: ConfigService) => {
        const httpConfig =
          configService.get<Typings.IHttpClientModuleConfiguration>('config.httpConfig');
        return httpConfig.aditionalPropagateHeaders.split(',') || '';
      },
      inject: [ConfigService],
    },
    {
      provide: AXIOS_INSTANCE_TOKEN,
      useValue: Axios,
    },
  ],
  exports: [HttpClientService, HTTP_MODULE_PROPAGATE_CUSTOM_HEADERS],
})
export class HttpClientModule {
  static register(config: HttpModuleOptions): DynamicModule {
    return {
      module: HttpClientModule,
      providers: [
        {
          provide: AXIOS_INSTANCE_TOKEN,
          useValue: createAxiosRetry(config),
        },
        {
          provide: HTTP_MODULE_ID,
          useValue: randomStringGenerator(),
        },
      ],
    };
  }
  static registerAsync(options: HttpModuleAsyncOptions): DynamicModule {
    return {
      module: HttpClientModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: AXIOS_INSTANCE_TOKEN,
          useFactory: (config: HttpModuleOptions) => createAxiosRetry(config),
          inject: [HTTP_MODULE_OPTIONS],
        },
        {
          provide: HTTP_MODULE_ID,
          useValue: randomStringGenerator(),
        },
        ...(options.extraProviders || []),
      ],
    };
  }

  private static createAsyncProviders(options: HttpModuleAsyncOptions): Provider[] {
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
    else if (options.useClass) inject = [options.useClass];

    return {
      provide: HTTP_MODULE_OPTIONS,
      useFactory: async (optionsFactory: HttpModuleOptionsFactory) =>
        optionsFactory.createHttpOptions(),
      inject,
    };
  }
}
