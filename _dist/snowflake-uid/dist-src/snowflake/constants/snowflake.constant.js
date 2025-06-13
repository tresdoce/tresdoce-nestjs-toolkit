export const SNOWFLAKE_MODULE_OPTIONS = Symbol('SNOWFLAKE_MODULE_OPTIONS');
export const DEFAULT_EPOCH = 1577836800000n;
export const DEFAULT_WORKER_ID = 1;
export const DEFAULT_PROCESS_ID = 1;
export const DEFAULT_TO_STRING = false;
export const DEFAULT_SNOWFLAKE_MODULE_OPTIONS = {
    epoch: DEFAULT_EPOCH,
    workerId: DEFAULT_WORKER_ID,
    processId: DEFAULT_PROCESS_ID,
    toString: DEFAULT_TO_STRING,
};
export const WORKER_ID_BITS = 5;
export const PROCESS_ID_BITS = 5;
export const SEQUENCE_BITS = 12;
export const MAX_WORKER_ID = -1 ^ (-1 << WORKER_ID_BITS);
export const MAX_PROCESS_ID = -1 ^ (-1 << PROCESS_ID_BITS);
export const SEQUENCE_MASK = -1 ^ (-1 << SEQUENCE_BITS);
