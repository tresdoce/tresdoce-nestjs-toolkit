import { ModuleMetadata, Type } from '@nestjs/common';

export interface RedactOptions {
  paths?: string[] | undefined;
  censor?: string | ((v: any) => any) | undefined;
  remove?: boolean | undefined;
  serialize?: boolean | ((v: any) => any) | undefined;
  strict?: boolean | undefined;
  obfuscateFrom?: 'left' | 'right' | undefined;
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
