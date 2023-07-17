import { ModuleMetadata, Type } from '@nestjs/common';

export interface RedactOptions {
  paths?: string[];
  censor?: string | ((v: any) => any);
  remove?: boolean;
  serialize?: boolean | ((v: any) => any);
  strict?: boolean;
  obfuscateFrom?: 'left' | 'right';
}

export type RedactModuleOptions = RedactOptions;

export interface RedactModuleOptionsFactory {
  createRedactOptions(): Promise<RedactModuleOptions> | RedactModuleOptions;
}

export interface RedactModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useClass?: Type<RedactModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedactModuleOptions> | RedactModuleOptions;
  inject?: any[];
}
