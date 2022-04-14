import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggingModule } from '@tresdoce-nestjs-toolkit/logging';
import { HttpClientModule } from '../lib/http.module';
import { defaultConfigInstanceAxios } from '../lib/constants/http.constants';
import { HttpModuleAsyncOptions } from '../lib/interfaces/http-module.interface';
import { config } from './utils';

class MockedClass {
  createHttpOptions() {
    return {
      ...defaultConfigInstanceAxios,
    };
  }
}

const mockedUseFactory: HttpModuleAsyncOptions = {
  useFactory: async () => ({
    ...defaultConfigInstanceAxios,
  }),
};

describe('HttpClientModule  using registerAsync useFactory', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        LoggingModule,
        HttpClientModule.registerAsync(mockedUseFactory),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  it('should be define', async () => {
    await expect(app).toBeDefined();
  });
});

const mockedUseClassOptions: HttpModuleAsyncOptions = {
  useClass: MockedClass,
};

describe('HttpClientModule using registerAsync useClass', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        LoggingModule,
        HttpClientModule.registerAsync(mockedUseClassOptions),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  it('should be define', async () => {
    await expect(app).toBeDefined();
  });
});

const mockedUseExistingOptions: HttpModuleAsyncOptions = {
  extraProviders: [MockedClass],
  useExisting: MockedClass,
};

describe('HttpClientModule using registerAsync useExisting', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        LoggingModule,
        HttpClientModule.registerAsync(mockedUseExistingOptions),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  it('should be define', async () => {
    await expect(app).toBeDefined();
  });
});

describe('HttpClientModule using register', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        LoggingModule,
        HttpClientModule.register({ ...config().httpConfig.httOptions }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  it('should be define', async () => {
    await expect(app).toBeDefined();
  });
});
