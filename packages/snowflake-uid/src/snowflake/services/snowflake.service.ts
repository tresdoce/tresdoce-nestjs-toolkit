import { Inject, Injectable } from '@nestjs/common';
import type {
  Snowflake,
  SnowFlakeOptions,
  SnowflakeParseResult,
} from '../interfaces/snowflake.interface.js';
import {
  DEFAULT_EPOCH,
  DEFAULT_TO_STRING,
  MAX_PROCESS_ID,
  MAX_TIMESTAMP_OFFSET,
  MAX_WORKER_ID,
  PROCESS_ID_BITS,
  SEQUENCE_BITS,
  SEQUENCE_MASK,
  SNOWFLAKE_MODULE_OPTIONS,
} from '../constants/snowflake.constant.js';

const PROCESS_ID_SHIFT = BigInt(SEQUENCE_BITS); // 12
const WORKER_ID_SHIFT = BigInt(SEQUENCE_BITS + PROCESS_ID_BITS); // 17
const TIMESTAMP_SHIFT = WORKER_ID_SHIFT + 5n; // 22
const NODE_MASK = 0x1fn;

@Injectable()
export class SnowflakeService {
  private readonly EPOCH: bigint;
  private readonly workerId: number;
  private readonly processId: number;
  // Not named `toString`: an own boolean `toString` property shadows Object.prototype.toString
  // and makes `String(service)` / template literals throw.
  private readonly asString: boolean;
  // Shared by every instance in the process so two instances never emit the same ID.
  private static lastTimestamp: bigint = -1n;
  private static sequence: number = 0;

  constructor(@Inject(SNOWFLAKE_MODULE_OPTIONS) private readonly options: SnowFlakeOptions) {
    const { epoch = DEFAULT_EPOCH, workerId, processId, asString } = this.options;

    if (!SnowflakeService.isInRange(workerId, MAX_WORKER_ID)) {
      throw new Error(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
    }

    if (!SnowflakeService.isInRange(processId, MAX_PROCESS_ID)) {
      throw new Error(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);
    }

    this.EPOCH = SnowflakeService.toEpoch(epoch);
    this.workerId = workerId;
    this.processId = processId;
    this.asString = SnowflakeService.resolveAsString(asString, this.options);
  }

  /**
   * `asString` wins; the deprecated `toString` option is the fallback. `toString` is inherited
   * from Object.prototype when omitted, so only a real boolean counts.
   */
  private static resolveAsString(asString: unknown, options: object): boolean {
    if (typeof asString === 'boolean') return asString;
    const legacyToString: unknown = (options as { toString?: unknown }).toString;
    if (typeof legacyToString === 'boolean') return legacyToString;
    return DEFAULT_TO_STRING;
  }

  generate(date: Date = new Date()): string | bigint {
    let timestamp: bigint = BigInt(date.valueOf());

    if (timestamp < this.EPOCH) {
      throw new Error('Invalid system clock: timestamp is before epoch');
    }

    if (timestamp < SnowflakeService.lastTimestamp) {
      throw new Error(
        `Invalid system clock: clock moved backwards ${SnowflakeService.lastTimestamp - timestamp}ms`,
      );
    }

    if (timestamp === SnowflakeService.lastTimestamp) {
      SnowflakeService.sequence = (SnowflakeService.sequence + 1) & SEQUENCE_MASK;
      if (SnowflakeService.sequence === 0) {
        timestamp = this.waitUntilNextMillis(SnowflakeService.lastTimestamp);
      }
    } else {
      SnowflakeService.sequence = 0;
    }

    const timestampOffset: bigint = timestamp - this.EPOCH;
    if (timestampOffset > MAX_TIMESTAMP_OFFSET) {
      throw new Error('Invalid system clock: timestamp exceeds the 41-bit range of the epoch');
    }

    SnowflakeService.lastTimestamp = timestamp;

    const id: bigint =
      (timestampOffset << TIMESTAMP_SHIFT) |
      (BigInt(this.workerId) << WORKER_ID_SHIFT) |
      (BigInt(this.processId) << PROCESS_ID_SHIFT) |
      BigInt(SnowflakeService.sequence);

    return this.asString ? id.toString() : id;
  }

  /**
   * Checks that the value is a positive integer whose timestamp is after the epoch and not in the future.
   * Worker, process and sequence are fixed-width bit fields, so any value they hold is valid.
   */
  isSnowflake(id: string | bigint): id is Snowflake {
    try {
      const timestamp = (BigInt(id) >> TIMESTAMP_SHIFT) + this.EPOCH;
      return timestamp > this.EPOCH && timestamp <= BigInt(Date.now());
    } catch {
      return false;
    }
  }

  parse(snowflake: string | bigint): SnowflakeParseResult {
    const id = BigInt(snowflake);
    const timestamp: number = Number((id >> TIMESTAMP_SHIFT) + this.EPOCH);
    const workerId: number = Number((id >> WORKER_ID_SHIFT) & NODE_MASK);
    const processId: number = Number((id >> PROCESS_ID_SHIFT) & NODE_MASK);
    const increment: number = Number(id & BigInt(SEQUENCE_MASK));

    return { timestamp, workerId, processId, increment };
  }

  private waitUntilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp: bigint = BigInt(Date.now());
    // The ms was given explicitly and is ahead of the clock: spinning would block until then.
    if (timestamp < lastTimestamp) {
      return lastTimestamp + 1n;
    }
    while (timestamp <= lastTimestamp) {
      timestamp = BigInt(Date.now());
    }
    return timestamp;
  }

  private static isInRange(value: number | undefined, max: number): value is number {
    return value !== undefined && Number.isInteger(value) && value >= 0 && value <= max;
  }

  private static toEpoch(epoch: bigint | number | string): bigint {
    let value: bigint;
    try {
      value = BigInt(epoch);
    } catch {
      value = -1n;
    }
    if (value < 0n) {
      throw new Error('Epoch must be a non-negative integer number of milliseconds');
    }
    return value;
  }
}
