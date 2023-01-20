import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { IAxiosRetryConfig } from 'axios-retry';
import { RawAxiosRequestConfig, CreateAxiosDefaults } from 'axios';

export type DefaultConfigAxiosInstance = RawAxiosRequestConfig;

export type HttpModuleOptions = CreateAxiosDefaults & IAxiosRetryConfig; //AxiosRequestConfig & IAxiosRetryConfig;

export interface HttpModuleOptionsFactory {
  createHttpOptions(): Promise<HttpModuleOptions> | HttpModuleOptions;
}

export interface HttpModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<HttpModuleOptionsFactory>;
  useClass?: Type<HttpModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<HttpModuleOptions> | HttpModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
