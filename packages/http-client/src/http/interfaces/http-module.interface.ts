import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { IAxiosRetryConfig } from 'axios-retry';
import { CreateAxiosDefaults } from 'axios';

export type HttpModuleOptions = CreateAxiosDefaults & IAxiosRetryConfig;

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
