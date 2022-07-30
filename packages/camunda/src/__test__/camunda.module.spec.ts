import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CamundaModule } from '../camunda/camunda.module';
import {
  dynamicConfig,
  tcName,
  TCRedisOptions,
  testContainers,
} from '@tresdoce-nestjs-toolkit/test-utils';

describe('CamundaModule', () => {
  let app: INestApplication;
  let container: testContainers;

  beforeAll(async () => {
    container = await new testContainers('camunda/camunda-bpm-platform:7.17.0', {
      ports: {
        container: 8080,
        host: 8080,
      },
      containerName: `${tcName}-camunda-bpm`,
      reuse: true,
    });
    await container.start();
  });

  afterAll(async () => {
    await container.stop({ removeVolumes: true });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            dynamicConfig({
              camunda: {
                baseUrl: 'http://localhost:8080/engine-rest',
              },
            }),
          ],
        }),
        CamundaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });
});
