import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingModule } from '../lib/logging.module';

const mockedConfig = {
  config: {
    server: {
      isProd: false,
      logLevel: 'trace',
    },
  },
};

describe('LoggingModule', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [jest.fn().mockImplementation(() => mockedConfig)],
        }),
        LoggingModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', async () => {
    await expect(app).toBeDefined();
  });
});
