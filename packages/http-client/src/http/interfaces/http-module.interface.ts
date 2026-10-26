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

/**
 * Shape of the `httpClient` key of the centralized config (`config.httpClient`).
 * Mirrors `Typings.IHttpClientConfig` from `@tresdoce-nestjs-toolkit/core`.
 */
export interface HttpClientConfig {
  httpOptions?: HttpModuleOptions;
  propagateHeaders?: string[];
}
