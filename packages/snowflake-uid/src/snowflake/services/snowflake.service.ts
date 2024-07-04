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

    const currentTimestamp: bigint = BigInt(Date.now());

    if (workerId! < 0 || workerId! > MAX_WORKER_ID) {
      throw new Error(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
    }

    if (processId! < 0 || processId! > MAX_PROCESS_ID) {
      throw new Error(`Process ID must be between 0 y ${MAX_PROCESS_ID}`);
    }

    this.EPOCH = epoch;
    this.workerId = workerId!;
    this.processId = processId!;
    this.toString = toString!;
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
      if (SnowflakeService.sequence === 0) {
        timestamp = this.waitUntilNextMillis(SnowflakeService.lastTimestamp);
      }
    } else {
      SnowflakeService.sequence = 0;
    }

    SnowflakeService.lastTimestamp = timestamp;

    const timestampOffset: bigint = BigInt(timestamp) - this.EPOCH;
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
      const binaryId = idBigInt.toString(2).padStart(64, '0');

      const timestampBits = binaryId.slice(0, 42);
      const timestamp = BigInt('0b' + timestampBits) + this.EPOCH;
      if (timestamp <= this.EPOCH || timestamp > BigInt(Date.now())) {
        return false;
      }

      const workerIdBits = binaryId.slice(42, 47);
      const workerId = parseInt(workerIdBits, 2);
      if (workerId < 0 || workerId > MAX_WORKER_ID) {
        return false;
      }

      const processIdBits = binaryId.slice(47, 52);
      const processId = parseInt(processIdBits, 2);
      if (processId < 0 || processId > MAX_PROCESS_ID) {
        return false;
      }

      const sequenceBits = binaryId.slice(52);
      const sequence = parseInt(sequenceBits, 2);
      if (sequence < 0 || sequence > SEQUENCE_MASK) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  parse(snowflake: Snowflake): SnowflakeParseResult {
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
      timestamp = BigInt(Date.now());
    }
    return timestamp;
  }
}
