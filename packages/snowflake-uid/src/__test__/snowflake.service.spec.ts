import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { SnowflakeModule } from '../snowflake/snowflake.module';
import { SnowflakeService } from '../snowflake/services/snowflake.service';
import {
  MAX_PROCESS_ID,
  MAX_WORKER_ID,
  SEQUENCE_MASK,
} from '../snowflake/constants/snowflake.constant';

describe('SnowflakeService', () => {
  let service: SnowflakeService;
  const EPOCH = 1577836800000n; // Epoch used in the tests

  beforeEach(async () => {
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
    jest.spyOn(global.Date, 'now').mockImplementationOnce(() => Number(EPOCH - 1n));
    expect(() => {
      const invalidTimestamp = new Date(Number(EPOCH) + 1);
      service.generate(invalidTimestamp);
      service.generate();
    }).toThrow('Invalid system clock');
  });

  it('should throw an error if the timestamp is before epoch', () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => Number(EPOCH - 1n));
    expect(() => {
      service.generate(new Date(Number(EPOCH - 2n)));
    }).toThrow('Invalid system clock: timestamp is before epoch');
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
  });

  it('should return false if workerId is out of range in isSnowflake', () => {
    const id = service.generate();
    const invalidWorkerId = MAX_WORKER_ID + 1;
    const invalidId = (BigInt(id.toString()) & ~(0x1fn << 17n)) | (BigInt(invalidWorkerId) << 17n);
    expect(service.isSnowflake(invalidId.toString())).toBe(false);
  });

  it('should return false if processId is out of range in isSnowflake', () => {
    const id = service.generate();
    const invalidProcessId = MAX_PROCESS_ID + 1;
    const invalidId = (BigInt(id.toString()) & ~(0x1fn << 12n)) | (BigInt(invalidProcessId) << 12n);
    expect(service.isSnowflake(invalidId.toString())).toBe(false);
  });

  it('should return false if sequence is out of range in isSnowflake', () => {
    const id = service.generate();
    const invalidSequence = SEQUENCE_MASK + 1;
    const invalidId = (BigInt(id.toString()) & ~BigInt(SEQUENCE_MASK)) | BigInt(invalidSequence);
    expect(service.isSnowflake(invalidId.toString())).toBe(false);
  });

  it('should wait until next millis if sequence overflows', () => {
    const timestamp = EPOCH + 1n;
    SnowflakeService['lastTimestamp'] = timestamp;
    SnowflakeService['sequence'] = SEQUENCE_MASK;

    jest.spyOn(global.Date, 'now').mockImplementation(() => Number(timestamp + 1n));

    const id = service.generate(new Date(Number(timestamp)));
    expect(service.isSnowflake(id)).toBe(true);
  });

  it('should reset sequence if timestamp advances', () => {
    const currentTimestamp = BigInt(Date.now());
    SnowflakeService['lastTimestamp'] = currentTimestamp;
    SnowflakeService['sequence'] = SEQUENCE_MASK;

    jest.spyOn(global.Date, 'now').mockImplementation(() => Number(currentTimestamp + 1n));

    const id = service.generate(new Date(Number(currentTimestamp + 1n)));
    expect(service.isSnowflake(id)).toBe(true);
    expect(SnowflakeService['sequence']).toBe(0);
  });

  it('should throw an error if workerId is not defined', () => {
    expect(() => {
      new SnowflakeService({
        epoch: EPOCH,
        // @ts-ignore
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
        // @ts-ignore
        processId: undefined,
        toString: true,
      });
    }).toThrow(`Process ID must be between 0 and ${MAX_PROCESS_ID}`);
  });
});
