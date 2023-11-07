import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import { HealthModule } from '../health/health.module';

describe('HealthModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HealthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});
