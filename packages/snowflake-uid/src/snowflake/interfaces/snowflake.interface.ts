export interface SnowFlakeOptions {
  /**
   * Custom epoch in milliseconds. Accepts `bigint`, `number` or a numeric `string`
   * (handy when it comes from an environment variable). Default: `1577836800000n` (2020-01-01 UTC).
   */
  epoch?: bigint | number | string;
  workerId?: number;
  processId?: number;
  /** When `true`, `generate()` returns the ID as a decimal `string` instead of a `bigint`. */
  asString?: boolean;
  /**
   * @deprecated Use `asString`. Kept for backwards compatibility; `asString` wins when both are set.
   * Typed as a union because every object inherits `Object.prototype.toString`: with a plain
   * `boolean` type, object literals that omit this option would not type-check.
   */
  toString?: boolean | (() => string);
}

export interface SnowflakeParseResult {
  timestamp: number;
  workerId: number;
  processId: number;
  increment: number;
}

export type Snowflake = `${bigint}`;
