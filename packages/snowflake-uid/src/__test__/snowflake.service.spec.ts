import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { SnowflakeModule } from '../snowflake/snowflake.module.js';
import { SnowflakeService } from '../snowflake/services/snowflake.service.js';
import {
  MAX_PROCESS_ID,
  MAX_TIMESTAMP_OFFSET,
  MAX_WORKER_ID,
  SEQUENCE_MASK,
} from '../snowflake/constants/snowflake.constant.js';

describe('SnowflakeService', () => {
  let service: SnowflakeService;
  const EPOCH = 1577836800000n; // Epoch used in the tests

  beforeEach(async () => {
    SnowflakeService['lastTimestamp'] = -1n;
    SnowflakeService['sequence'] = 0;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              snowflakeUID: {
                epoch: EPOCH,
                workerId: 1,
                processId: 1,
                toString: true,
              },
            }),
          ],
        }),
        SnowflakeModule,
      ],
      providers: [SnowflakeService],
    }).compile();

    service = module.get<SnowflakeService>(SnowflakeService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a snowflake ID as a string', () => {
    const id = service.generate();
    expect(typeof id).toBe('string');
    expect(service.isSnowflake(id)).toBe(true);
  });

  it('should generate a snowflake ID as a bigint', () => {
    const serviceWithBigInt = new SnowflakeService({
      epoch: EPOCH,
      workerId: 1,
      processId: 1,
      toString: false,
    });
    const id = serviceWithBigInt.generate();
    expect(typeof id).toBe('bigint');
    expect(serviceWithBigInt.isSnowflake(id)).toBe(true);
  });

  it('should default to bigint output and default epoch when omitted', () => {
    const svc = new SnowflakeService({ workerId: 2, processId: 3 });
    const id = svc.generate(new Date(Number(EPOCH) + 1000));
    expect(id).toBe((1000n << 22n) | (2n << 17n) | (3n << 12n));
  });

  it('should accept the epoch as number or numeric string', () => {
    const date = new Date(Number(EPOCH) + 5);
    const fromNumber = new SnowflakeService({ epoch: Number(EPOCH), workerId: 1, processId: 1 });
    expect(fromNumber.parse(fromNumber.generate(date)).timestamp).toBe(date.getTime());
    SnowflakeService['lastTimestamp'] = -1n;
    const fromString = new SnowflakeService({ epoch: `${EPOCH}`, workerId: 1, processId: 1 });
    expect(fromString.parse(fromString.generate(date)).timestamp).toBe(date.getTime());
  });

  it('should throw if the epoch is not a non-negative integer', () => {
    const message = 'Epoch must be a non-negative integer number of milliseconds';
    expect(() => new SnowflakeService({ epoch: 'abc', workerId: 1, processId: 1 })).toThrow(
      message,
    );
    expect(() => new SnowflakeService({ epoch: 1.5, workerId: 1, processId: 1 })).toThrow(message);
    expect(() => new SnowflakeService({ epoch: -1n, workerId: 1, processId: 1 })).toThrow(message);
  });

  it('should not shadow Object.prototype.toString on the instance', () => {
    expect(typeof (service as unknown as Record<string, unknown>).toString).toBe('function');
  });

  it('should prefer asString over the deprecated toString option', () => {
    const date = new Date(Number(EPOCH) + 20);
    const asBigInt = new SnowflakeService({
      workerId: 1,
      processId: 1,
      asString: false,
      toString: true,
    });
    expect(typeof asBigInt.generate(date)).toBe('bigint');
    const asText = new SnowflakeService({ workerId: 1, processId: 1, asString: true });
    expect(typeof asText.generate(date)).toBe('string');
  });

  it('should encode and decode every field', () => {
    const date = new Date('2024-01-01T00:00:00.123Z');
    const id = service.generate(date);
    expect(id).toBe('529448672157634560');
    expect(service.parse(id)).toEqual({
      timestamp: date.getTime(),
      workerId: 1,
      processId: 1,
      increment: 0,
    });
  });

  it('should increment the sequence within the same millisecond and keep IDs monotonic', () => {
    const date = new Date(Number(EPOCH) + 10);
    const ids = Array.from({ length: 5 }, () => BigInt(service.generate(date)));
    expect(ids.map((id) => service.parse(id).increment)).toEqual([0, 1, 2, 3, 4]);
    expect(new Set(ids).size).toBe(5);
    expect([...ids].sort((a, b) => (a < b ? -1 : 1))).toEqual(ids);
  });

  it('should generate unique IDs in a tight loop', () => {
    const ids = new Set(Array.from({ length: 10_000 }, () => service.generate()));
    expect(ids.size).toBe(10_000);
  });

  it('should validate a valid snowflake ID', () => {
    const id = service.generate();
    expect(service.isSnowflake(id)).toBe(true);
  });

  it('should not validate an invalid snowflake ID', () => {
    const invalidId = '123456';
    expect(service.isSnowflake(invalidId)).toBe(false);
  });

  it('should parse a snowflake ID correctly', () => {
    const id = service.generate();
    const parsed = service.parse(id.toString() as `${bigint}`);
    expect(parsed).toHaveProperty('timestamp');
    expect(parsed).toHaveProperty('workerId');
    expect(parsed).toHaveProperty('processId');
    expect(parsed).toHaveProperty('increment');
  });

  it('should throw an error if the system clock is invalid', () => {
    expect(() => {
      service.generate(new Date(Number(EPOCH) + 10));
      service.generate(new Date(Number(EPOCH) + 1));
    }).toThrow('Invalid system clock: clock moved backwards 9ms');
  });

  it('should throw an error if the timestamp is before epoch', () => {
    expect(() => {
      service.generate(new Date(Number(EPOCH - 2n)));
    }).toThrow('Invalid system clock: timestamp is before epoch');
  });

  it('should throw an error if the timestamp exceeds the 41-bit range', () => {
    expect(() => {
      service.generate(new Date(Number(EPOCH + MAX_TIMESTAMP_OFFSET + 1n)));
    }).toThrow('Invalid system clock: timestamp exceeds the 41-bit range of the epoch');
    // State is untouched, so a valid timestamp still works afterwards.
    expect(service.isSnowflake(service.generate())).toBe(true);
  });

  it('should throw an error if workerId is out of range', () => {
    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        workerId: MAX_WORKER_ID + 1,
        processId: 1,
        toString: true,
      });
    }).toThrow(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);

    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        workerId: -1,
        processId: 1,
        toString: true,
      });
    }).toThrow(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);

    expect(() => {
      new SnowflakeService({ epoch: EPOCH, workerId: 1.5, processId: 1 });
    }).toThrow(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
  });

  it('should throw an error if processId is out of range', () => {
    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        workerId: 1,
        processId: MAX_PROCESS_ID + 1,
        toString: true,
      });
    }).toThrow(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);

    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        workerId: 1,
        processId: -1,
        toString: true,
      });
    }).toThrow(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);

    expect(() => {
      new SnowflakeService({ epoch: EPOCH, workerId: 1, processId: Number.NaN });
    }).toThrow(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);
  });

  it('should return false for an ID whose timestamp is in the future', () => {
    const future = ((BigInt(Date.now()) + 60_000n - EPOCH) << 22n) | (1n << 17n) | (1n << 12n);
    expect(service.isSnowflake(future)).toBe(false);
  });

  it('should return false for negative IDs and values that are not integers', () => {
    expect(service.isSnowflake('-4194304')).toBe(false);
    expect(service.isSnowflake('abc')).toBe(false);
    expect(service.isSnowflake('1.5')).toBe(false);
  });

  it('should accept IDs with any worker/process/sequence value', () => {
    const id = BigInt(service.generate());
    const tampered = id | (BigInt(MAX_WORKER_ID) << 17n) | (BigInt(MAX_PROCESS_ID) << 12n);
    expect(service.isSnowflake(tampered | BigInt(SEQUENCE_MASK))).toBe(true);
    expect(service.parse(tampered | BigInt(SEQUENCE_MASK))).toMatchObject({
      workerId: MAX_WORKER_ID,
      processId: MAX_PROCESS_ID,
      increment: SEQUENCE_MASK,
    });
  });

  it('should wait until next millis if sequence overflows', () => {
    const timestamp = EPOCH + 1n;
    SnowflakeService['lastTimestamp'] = timestamp;
    SnowflakeService['sequence'] = SEQUENCE_MASK;

    vi.spyOn(global.Date, 'now').mockImplementation(() => Number(timestamp + 1n));

    const id = service.generate(new Date(Number(timestamp)));
    expect(service.parse(id)).toMatchObject({ timestamp: Number(timestamp + 1n), increment: 0 });
  });

  it('should spin while the clock is still in the overflowed millisecond', () => {
    const timestamp = EPOCH + 1n;
    SnowflakeService['lastTimestamp'] = timestamp;
    SnowflakeService['sequence'] = SEQUENCE_MASK;

    const now = vi
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => Number(timestamp))
      .mockImplementationOnce(() => Number(timestamp))
      .mockImplementation(() => Number(timestamp + 1n));

    const id = service.generate(new Date(Number(timestamp)));
    expect(now).toHaveBeenCalledTimes(3);
    expect(service.parse(id)).toMatchObject({ timestamp: Number(timestamp + 1n), increment: 0 });
  });

  it('should not block when the overflowed millisecond is ahead of the clock', () => {
    const future = BigInt(Date.now()) + 60_000n;
    SnowflakeService['lastTimestamp'] = future;
    SnowflakeService['sequence'] = SEQUENCE_MASK;

    const id = service.generate(new Date(Number(future)));
    expect(service.parse(id)).toMatchObject({ timestamp: Number(future + 1n), increment: 0 });
  });

  it('should reset sequence if timestamp advances', () => {
    const currentTimestamp = BigInt(Date.now());
    SnowflakeService['lastTimestamp'] = currentTimestamp;
    SnowflakeService['sequence'] = SEQUENCE_MASK;

    vi.spyOn(global.Date, 'now').mockImplementation(() => Number(currentTimestamp + 1n));

    const id = service.generate(new Date(Number(currentTimestamp + 1n)));
    expect(service.isSnowflake(id)).toBe(true);
    expect(SnowflakeService['sequence']).toBe(0);
  });

  it('should throw an error if workerId is not defined', () => {
    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        workerId: undefined,
        processId: 1,
        toString: true,
      });
    }).toThrow(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
  });

  it('should throw an error if processId is not defined', () => {
    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        workerId: 1,
        processId: undefined,
        toString: true,
      });
    }).toThrow(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);
  });
});
