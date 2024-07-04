import { SnowFlakeOptions } from '../interfaces/snowflake.interface';

export const SNOWFLAKE_MODULE_OPTIONS = Symbol('SNOWFLAKE_MODULE_OPTIONS');
export const DEFAULT_EPOCH: bigint = 1577836800000n;
export const DEFAULT_WORKER_ID: number = 1;
export const DEFAULT_PROCESS_ID: number = 1;
export const DEFAULT_TO_STRING: boolean = false;

export const DEFAULT_SNOWFLAKE_MODULE_OPTIONS: SnowFlakeOptions = {
  epoch: DEFAULT_EPOCH,
  workerId: DEFAULT_WORKER_ID,
  processId: DEFAULT_PROCESS_ID,
  toString: DEFAULT_TO_STRING,
};

export const WORKER_ID_BITS: number = 5;
export const PROCESS_ID_BITS: number = 5;
export const SEQUENCE_BITS: number = 12;
export const MAX_WORKER_ID: number = -1 ^ (-1 << WORKER_ID_BITS);
export const MAX_PROCESS_ID: number = -1 ^ (-1 << PROCESS_ID_BITS);
export const SEQUENCE_MASK: number = -1 ^ (-1 << SEQUENCE_BITS);
