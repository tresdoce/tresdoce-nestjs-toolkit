import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { SnowflakeModule } from '../snowflake/snowflake.module.js';
import { SnowflakeService } from '../snowflake/services/snowflake.service.js';
import {
  DEFAULT_SNOWFLAKE_MODULE_OPTIONS,
  SNOWFLAKE_MODULE_OPTIONS,
} from '../snowflake/constants/snowflake.constant.js';
import type { SnowFlakeOptions } from '../snowflake/interfaces/snowflake.interface.js';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

const createModule = (snowflakeUID?: SnowFlakeOptions): Promise<TestingModule> =>
  Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [dynamicConfig(snowflakeUID ? { snowflakeUID } : {})],
      }),
      SnowflakeModule,
    ],
  }).compile();

describe('SnowflakeModule', () => {
  let app: INestApplication;
  let service: SnowflakeService;

  beforeEach(async () => {
    const moduleFixture = await createModule();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<SnowflakeService>(SnowflakeService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should provide SnowflakeService', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(SnowflakeService);
  });

  it('should use the default options when snowflakeUID is not configured', () => {
    expect(app.get(SNOWFLAKE_MODULE_OPTIONS)).toEqual(DEFAULT_SNOWFLAKE_MODULE_OPTIONS);
  });

  it('should merge a partial config with the defaults, ignoring undefined values', async () => {
    const moduleFixture = await createModule({ workerId: 7, processId: undefined });
    expect(moduleFixture.get(SNOWFLAKE_MODULE_OPTIONS)).toEqual({
      ...DEFAULT_SNOWFLAKE_MODULE_OPTIONS,
      workerId: 7,
    });
    const svc = moduleFixture.get(SnowflakeService);
    expect(svc.parse(svc.generate())).toMatchObject({ workerId: 7, processId: 1 });
  });
});
