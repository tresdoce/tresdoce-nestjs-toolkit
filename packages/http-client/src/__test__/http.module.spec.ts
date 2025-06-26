import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { HttpClientModule } from '../http/httpClient.module';
import {
  HttpModuleAsyncOptions,
  HttpModuleOptions,
  HttpModuleOptionsFactory,
} from '../http/interfaces/http-module.interface';

class MockedClass implements HttpModuleOptionsFactory {
  createHttpOptions(): HttpModuleOptions {
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

const mockedUseClassOptions: HttpModuleAsyncOptions = {
  useClass: MockedClass,
};

const mockedUseExistingOptions: HttpModuleAsyncOptions = {
  extraProviders: [MockedClass],
  useExisting: MockedClass,
};

describe('HttpClientModule', () => {
  describe('HttpClientModule - global', () => {
    describe('global - with config', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig({
                  httpClient: {
                    httpOptions: {
                      timeout: 5000,
                      maxRedirects: 5,
                      headers: {
                        'some-header': 'some-value',
                      },
                    },
                    propagateHeaders: ['x-custom-header', 'x-custom-header-propagate'],
                  },
                }),
              ],
            }),
            HttpClientModule,
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });

    describe('global', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [dynamicConfig()],
            }),
            HttpClientModule,
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });
  });

  describe('HttpClientModule.register', () => {
    describe('register - with config', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig({
                  httpClient: {
                    httpOptions: {
                      headers: {
                        'some-header': 'some-value',
                      },
                    },
                    propagateHeaders: ['x-custom-header', 'x-custom-header-propagate'],
                  },
                }),
              ],
            }),
            HttpClientModule.register({
              timeout: 5000,
              maxRedirects: 5,
            }),
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });

    describe('register', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [dynamicConfig()],
            }),
            HttpClientModule.register({
              timeout: 5000,
              maxRedirects: 5,
            }),
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });
  });

  describe('HttpClientModule.registerAsync', () => {
    describe('useFactory', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [dynamicConfig()],
            }),
            HttpClientModule.registerAsync(mockedUseFactory),
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });

    describe('useClass', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [dynamicConfig()],
            }),
            HttpClientModule.registerAsync(mockedUseClassOptions),
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });

    describe('useExisting', () => {
      let app: INestApplication;
      beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [dynamicConfig()],
            }),
            HttpClientModule.registerAsync(mockedUseExistingOptions),
          ],
        }).compile();
        app = module.createNestApplication();
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be define', async () => {
        expect(app).toBeDefined();
      });
    });
  });
});
