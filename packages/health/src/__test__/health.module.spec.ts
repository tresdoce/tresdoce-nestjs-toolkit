import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';

import { HealthModule } from '../health/health.module';
import { LivenessController } from '../health/controllers/liveness.controller';
import { ReadinessController } from '../health/controllers/readiness.controller';

describe('HealthModule', () => {
  let app: INestApplication;
  let livenessController: LivenessController;
  let readinessController: ReadinessController;

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
    livenessController = module.get<LivenessController>(LivenessController);
    readinessController = module.get<ReadinessController>(ReadinessController);
    await app.init();
  });

  afterEach(async () => {
    await Promise.all([app.close()]);
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });

  it('should be return status up', async () => {
    expect(livenessController.getLiveness()).toEqual({ status: 'up' });
  });

  it('should be return readiness services', async () => {
    const result = await readinessController.check();
    expect(result).toHaveProperty('details');
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('info');
    expect(result).toHaveProperty('status');
  });
});
