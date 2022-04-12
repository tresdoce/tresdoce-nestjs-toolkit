import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HttpClientModule } from '../http/httpClient.module';
import { config } from './utils';
import { HttpModuleAsyncOptions } from '../http/interfaces/http-module.interface';

class MockedClass {
  createHttpOptions() {
    return {
      timeout: 5000,
      maxRedirects: 5,
    };
  }
}

const mockedUseFactory: HttpModuleAsyncOptions = {
  useFactory: async () => ({
    timeout: 5000,
    maxRedirects: 5,
  }),
};

describe('HttpModule - registerAsync useFactory', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HttpClientModule.registerAsync(mockedUseFactory),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});

const mockedUseClassOptions: HttpModuleAsyncOptions = {
  useClass: MockedClass,
};

describe('HttpModule - registerAsync useClass', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HttpClientModule.registerAsync(mockedUseClassOptions),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});

const mockedUseExistingOptions: HttpModuleAsyncOptions = {
  extraProviders: [MockedClass],
  useExisting: MockedClass,
};

describe('HttpModule - registerAsync useExisting', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HttpClientModule.registerAsync(mockedUseExistingOptions),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});

describe('HttpModule - register', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [config],
        }),
        HttpClientModule.register({ ...config().httOptions }),
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be define', async () => {
    expect(app).toBeDefined();
  });
});
