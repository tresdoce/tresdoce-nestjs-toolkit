import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { KafkaModule } from '../kafka/kafka.module.js';
import { kafkaTestBaseConfig } from './utils/kafka-config.js';

vi.setConfig({ testTimeout: 45000 });

describe('KafkaModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        KafkaModule,
        await ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              kafka: kafkaTestBaseConfig,
            }),
          ],
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});
