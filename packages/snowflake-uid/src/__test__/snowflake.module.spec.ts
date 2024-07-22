import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { SnowflakeModule } from '../snowflake/snowflake.module';
import { SnowflakeService } from '../snowflake/services/snowflake.service';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

describe('SnowflakeModule', () => {
  let app: INestApplication;
  let service: SnowflakeService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [dynamicConfig({})],
        }),
        SnowflakeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    service = moduleFixture.get<SnowflakeService>(SnowflakeService);
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should provide SnowflakeService', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(SnowflakeService);
  });
});
