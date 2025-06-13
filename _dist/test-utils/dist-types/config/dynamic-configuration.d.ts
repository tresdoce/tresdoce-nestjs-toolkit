import { Typings } from '@tresdoce-nestjs-toolkit/core';
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export declare const dynamicConfig: ({ ...args }?: DeepPartial<Typings.AppConfig>) => (() => Typings.AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<Typings.AppConfig>;
export {};
