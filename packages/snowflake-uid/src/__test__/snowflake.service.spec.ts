import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { SnowflakeModule } from '../snowflake/snowflake.module';
import { SnowflakeService } from '../snowflake/services/snowflake.service';
import { MAX_WORKER_ID, MAX_PROCESS_ID } from '../snowflake/constants/snowflake.constant';

describe('SnowflakeService', () => {
  let service: SnowflakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              snowflakeUID: {
                epoch: 1577836800000n,
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
      epoch: 1577836800000n,
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
    jest.spyOn(global.Date, 'now').mockImplementationOnce(() => Number(1577836800000n - 1n));
    expect(() => {
      const invalidTimestamp = new Date(Number(1577836800000n) + 1);
      service.generate(invalidTimestamp);
      service.generate();
    }).toThrow('Invalid system clock');
  });

  it('should throw an error if the timestamp is before epoch', () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => Number(1577836800000n - 1n));
    const serviceWithSmallEpoch = new SnowflakeService({
      epoch: 1577836800000n,
      workerId: 1,
      processId: 1,
      toString: true,
    });

    expect(() => serviceWithSmallEpoch.generate(new Date(Number(1577836800000n - 2n)))).toThrow(
      'Invalid system clock: timestamp is before epoch',
    );
  });

  it('should throw an error if workerId is out of range', () => {
    expect(() => {
      new SnowflakeService({
        epoch: 1577836800000n,
        workerId: MAX_WORKER_ID + 1,
        processId: 1,
        toString: true,
      });
    }).toThrow(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);

    expect(() => {
      new SnowflakeService({
        epoch: 1577836800000n,
        workerId: -1,
        processId: 1,
        toString: true,
      });
    }).toThrow(`Worker ID must be between 0 and ${MAX_WORKER_ID}`);
  });

  it('should throw an error if processId is out of range', () => {
    expect(() => {
      new SnowflakeService({
        epoch: 1577836800000n,
        workerId: 1,
        processId: MAX_PROCESS_ID + 1,
        toString: true,
      });
    }).toThrow(`Process ID must be between 0 y ${MAX_PROCESS_ID}`);

    expect(() => {
      new SnowflakeService({
        epoch: 1577836800000n,
        workerId: 1,
        processId: -1,
        toString: true,
      });
    }).toThrow(`Process ID must be between 0 y ${MAX_PROCESS_ID}`);
  });
});
