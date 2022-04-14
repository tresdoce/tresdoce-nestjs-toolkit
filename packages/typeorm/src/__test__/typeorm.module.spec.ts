import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { TypeOrmClientModule } from '../lib/typeorm.module';
import { config } from './utils';
import { initContainerDB, stopDbContainer } from './utils/setupMongoContainer';

jest.setTimeout(70000);
describe('DatabaseModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await initContainerDB();
  });

  afterAll(async () => {
    await stopDbContainer();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        TypeOrmClientModule,
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  }, 50000);
});
