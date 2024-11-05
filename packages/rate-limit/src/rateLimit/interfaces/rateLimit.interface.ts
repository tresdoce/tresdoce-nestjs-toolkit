import { ModuleMetadata, Provider, Type } from '@nestjs/common';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

// Interfaz para una clase de fábrica que genera opciones del módulo.
export interface RateLimitModuleOptionsFactory {
  createOptions(): Promise<ThrottlerModuleOptions> | ThrottlerModuleOptions;
}

// Opciones para el registro asíncrono del módulo.
export interface RateLimitModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<RateLimitModuleOptionsFactory>;
  useClass?: Type<RateLimitModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ThrottlerModuleOptions> | ThrottlerModuleOptions;
  inject?: any[];
  imports?: ModuleMetadata['imports'];
  extraProviders?: Provider[];
}
