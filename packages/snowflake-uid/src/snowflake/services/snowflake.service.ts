import { Inject, Injectable } from '@nestjs/common';
import {
  Snowflake,
  SnowFlakeOptions,
  SnowflakeParseResult,
} from '../interfaces/snowflake.interface';
import {
  MAX_WORKER_ID,
  MAX_PROCESS_ID,
  SEQUENCE_MASK,
  SNOWFLAKE_MODULE_OPTIONS,
} from '../constants/snowflake.constant';

@Injectable()
export class SnowflakeService {
  private readonly EPOCH: bigint;
  private readonly workerId: number;
  private readonly processId: number;
  private readonly toString: boolean;
  private static lastTimestamp: bigint = -1n;
  private static sequence: number = 0;

  constructor(@Inject(SNOWFLAKE_MODULE_OPTIONS) private readonly options: SnowFlakeOptions) {
    const { epoch, workerId, processId, toString } = this.options;

    if (workerId === undefined || workerId < 0 || workerId > MAX_WORKER_ID) {
      throw new Error(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
    }

    if (processId === undefined || processId < 0 || processId > MAX_PROCESS_ID) {
      throw new Error(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);
    }

    this.EPOCH = epoch;
    this.workerId = workerId;
    this.processId = processId;
    this.toString = toString;
  }

  generate(date: Date = new Date()): string | bigint {
    let timestamp: bigint = BigInt(date.valueOf());

    if (timestamp < this.EPOCH) {
      throw new Error('Invalid system clock: timestamp is before epoch');
    }

    if (timestamp < SnowflakeService.lastTimestamp) {
      throw new Error('Invalid system clock');
    }

    if (timestamp === SnowflakeService.lastTimestamp) {
      SnowflakeService.sequence = (SnowflakeService.sequence + 1) & SEQUENCE_MASK;
      /* istanbul ignore next */
      if (SnowflakeService.sequence === 0) {
        timestamp = this.waitUntilNextMillis(SnowflakeService.lastTimestamp);
      }
    } else {
      SnowflakeService.sequence = 0;
    }

    SnowflakeService.lastTimestamp = timestamp;

    const timestampOffset: bigint = timestamp - this.EPOCH;
    const id: bigint =
      (timestampOffset << 22n) |
      (BigInt(this.workerId) << 17n) |
      (BigInt(this.processId) << 12n) |
      BigInt(SnowflakeService.sequence);

    return this.toString ? id.toString() : id;
  }

  isSnowflake(id: string | bigint): id is Snowflake {
    try {
      const idBigInt = BigInt(id.toString());

      const timestamp = (idBigInt >> 22n) + this.EPOCH;
      if (timestamp <= this.EPOCH || timestamp > BigInt(Date.now())) {
        return false;
      }

      const workerId = Number((idBigInt >> 17n) & 0x1fn);
      /* istanbul ignore next */
      if (workerId < 0 || workerId > MAX_WORKER_ID) {
        return false;
      }

      const processId = Number((idBigInt >> 12n) & 0x1fn);
      /* istanbul ignore next */
      if (processId < 0 || processId > MAX_PROCESS_ID) {
        return false;
      }

      const sequence = Number(idBigInt & BigInt(SEQUENCE_MASK));
      return sequence >= 0 && sequence <= SEQUENCE_MASK;
    } catch {
      /* istanbul ignore next */
      return false;
    }
  }

  parse(snowflake: string | bigint): SnowflakeParseResult {
    const id = BigInt(snowflake);
    const timestamp: number = Number((id >> 22n) + this.EPOCH);
    const workerId: number = Number((id & 0x3e0000n) >> 17n);
    const processId: number = Number((id & 0x1f000n) >> 12n);
    const increment: number = Number(id & 0xfffn);

    return { timestamp, workerId, processId, increment };
  }

  private waitUntilNextMillis(lastTimestamp: bigint): bigint {
    let timestamp: bigint = BigInt(Date.now());
    while (timestamp <= lastTimestamp) {
      /* istanbul ignore next */
      timestamp = BigInt(Date.now());
    }
    return timestamp;
  }
}
