import { LoggerOptions } from 'winston';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { Type } from '@nestjs/common';

export type LoggingModuleOptions = LoggerOptions;

export type NestLikeConsoleFormatOptions = {
  colors?: boolean;
  prettyPrint?: boolean;
};

export interface LoggingModuleOptionsFactory {
  createWinstonModuleOptions(): Promise<LoggingModuleOptions> | LoggingModuleOptions;
}

export interface LoggingModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<LoggingModuleOptions> | LoggingModuleOptions;
  inject?: any[];
  useClass?: Type<LoggingModuleOptionsFactory>;
}
