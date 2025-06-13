import { RequestMethod } from '@nestjs/common';
export declare const corePathsExcludes: () => {
    path: string;
    method: RequestMethod;
}[];
export declare const excludePaths: () => string[];
export declare const corePathsExcludesGlobs: string[];
