export interface SnowFlakeOptions {
  epoch: bigint;
  workerId?: number;
  processId?: number;
  toString?: boolean;
}

export interface SnowflakeParseResult {
  timestamp: number;
  workerId: number;
  processId: number;
  increment: number;
}

export type Snowflake = `${bigint}`;
