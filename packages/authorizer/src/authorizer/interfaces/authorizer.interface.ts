import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { ConfigType } from '@authorizerdev/authorizer-js';

export interface AuthorizerModuleOptions extends ConfigType{}

export interface AuthorizerModuleOptionsFactory {
  createAuthorizerOptions(): Promise<AuthorizerModuleOptions> | AuthorizerModuleOptions;
}

export interface AuthorizerModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'>{
  useExisting?: Type<AuthorizerModuleOptionsFactory>;
  useClass?: Type<AuthorizerModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AuthorizerModuleOptions> | AuthorizerModuleOptions;
  inject?: any[];
  extraProviders?: Provider[];
}
