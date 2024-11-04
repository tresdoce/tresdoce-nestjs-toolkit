import { DynamicModule, ModuleMetadata, Provider, Type } from '@nestjs/common';

// Opciones básicas para el módulo.
export interface RateLimitModuleOptions {
  apiPrefix: string;
  apiName?: string;
}

// Interfaz para una clase de fábrica que genera opciones del módulo.
export interface RateLimitModuleOptionsFactory {
  createOptions(): Promise<RateLimitModuleOptions> | RateLimitModuleOptions;
}

// Opciones para el registro asíncrono del módulo.
export interface RateLimitModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<RateLimitModuleOptionsFactory>;
  useClass?: Type<RateLimitModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RateLimitModuleOptions> | RateLimitModuleOptions;
  inject?: any[];
  imports?: ModuleMetadata['imports'];
  extraProviders?: Provider[];
}
