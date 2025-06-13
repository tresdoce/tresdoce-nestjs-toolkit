import { RequestMethod } from '@nestjs/common';
export declare const CONFIG_OPTIONS = "CONFIG_OPTIONS";
export declare const DEFAULT_SERVICE_LIVENESS_PATH = "/health/liveness";
export declare const controllersExcludes: {
    path: string;
    method: RequestMethod;
}[];
