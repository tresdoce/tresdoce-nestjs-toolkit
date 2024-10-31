import { DynamicModule, ModuleMetadata, Provider, Type } from '@nestjs/common';

// Opciones básicas para el módulo.
export interface AwsSqsModuleOptions {
  apiPrefix: string;
  apiName?: string;
}

// Interfaz para una clase de fábrica que genera opciones del módulo.
export interface AwsSqsModuleOptionsFactory {
  createOptions(): Promise<AwsSqsModuleOptions> | AwsSqsModuleOptions;
}

// Opciones para el registro asíncrono del módulo.
export interface AwsSqsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<AwsSqsModuleOptionsFactory>;
  useClass?: Type<AwsSqsModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<AwsSqsModuleOptions> | AwsSqsModuleOptions;
  inject?: any[];
  imports?: ModuleMetadata['imports'];
  extraProviders?: Provider[];
}
