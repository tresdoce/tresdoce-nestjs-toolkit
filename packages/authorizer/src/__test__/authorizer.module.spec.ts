import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';

import { AuthorizerModule } from '../authorizer/authorizer.module';
import { AUTHORIZER_CLIENT } from '../authorizer/constants/authorizer.constant';
import { AuthorizerModuleAsyncOptions, AuthorizerModuleOptions } from '../authorizer/interfaces/authorizer.interface';

class MockedClass {
  createAuthorizerOptions(){
    return {
      authorizerURL: 'https://example.com',
      redirectURL: 'http://yourapp.com/callback',
      clientID: 'your-client-id'
    }
  }
}

const mockedUseFactory: AuthorizerModuleAsyncOptions = {
  useFactory: async () => ({
    authorizerURL: 'https://example.com',
    redirectURL: 'http://yourapp.com/callback',
    clientID: 'your-client-id'
  })
}

const mockedUseClassOptions: AuthorizerModuleAsyncOptions = {
  useClass: MockedClass,
}

const mockedUseExistingOptions: AuthorizerModuleAsyncOptions = {
  extraProviders: [MockedClass],
  useExisting: MockedClass,
}

describe('AuthorizerModule', () => {
  let app: INestApplication;

  describe('AuthorizerModule', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load:[ dynamicConfig({
              authorizer: {
                authorizerURL: 'https://example.com',
                redirectURL: 'http://yourapp.com/callback',
                clientID: 'your-client-id'
              }
            })]
          }),
          AuthorizerModule
        ],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await  app.close();
    })

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should have the AuthorizerClient available', () => {
      const client = app.get(AUTHORIZER_CLIENT);
      expect(client).toBeDefined();
    });
  });

  describe('AuthorizerModule.register', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AuthorizerModule.register({
          authorizerURL: 'https://example.com',
          redirectURL: 'http://yourapp.com/callback',
          clientID: 'your-client-id'
        })],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await  app.close();
    })

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should have the AuthorizerClient available', () => {
      const client = app.get(AUTHORIZER_CLIENT);
      expect(client).toBeDefined();
    });
  });

  describe('AuthorizerModule.registerAsync', () => {
    describe('useFactory', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig()
              ],
            }),
            AuthorizerModule.registerAsync(mockedUseFactory)
          ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      afterAll(async () => {
        await  app.close();
      })

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should have the AuthorizerClient available', () => {
        const client = app.get(AUTHORIZER_CLIENT);
        expect(client).toBeDefined();
      });
    })

    describe('useClass', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig()
              ],
            }),
            AuthorizerModule.registerAsync(mockedUseClassOptions)
          ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      afterAll(async () => {
        await  app.close();
      })

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should have the AuthorizerClient available', () => {
        const client = app.get(AUTHORIZER_CLIENT);
        expect(client).toBeDefined();
      });
    })

    describe('useExisting', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig()
              ],
            }),
            AuthorizerModule.registerAsync(mockedUseExistingOptions)
          ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      afterAll(async () => {
        await  app.close();
      })

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should have the AuthorizerClient available', () => {
        const client = app.get(AUTHORIZER_CLIENT);
        expect(client).toBeDefined();
      });
    })
  });

  describe('AuthorizerModule.forRoot', () => {
    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AuthorizerModule.forRoot({
          authorizerURL: 'https://example.com',
          redirectURL: 'http://yourapp.com/callback',
          clientID: 'your-client-id'
        })],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    });

    afterAll(async () => {
      await  app.close();
    })

    it('should be defined', () => {
      expect(app).toBeDefined();
    });

    it('should have the AuthorizerClient available', () => {
      const client = app.get(AUTHORIZER_CLIENT);
      expect(client).toBeDefined();
    });
  });

  describe('AuthorizerModule.forRootAsync', () => {

    describe('imports', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig({
                  authorizer: {
                    authorizerURL: 'https://example.com',
                    redirectURL: 'http://yourapp.com/callback',
                    clientID: 'your-client-id'
                  }
                })
              ],
            }),
            AuthorizerModule.forRootAsync({
              imports: [ConfigModule],
              useFactory: async (configService: ConfigService): Promise<AuthorizerModuleOptions> =>
                configService.get('config.authorizer'),
              inject: [ConfigService],
            })
          ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      afterAll(async () => {
        await  app.close();
      })

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should have the AuthorizerClient available', () => {
        const client = app.get(AUTHORIZER_CLIENT);
        expect(client).toBeDefined();
      });
    })

    describe('without imports', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            AuthorizerModule.forRootAsync(mockedUseFactory)
          ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
      });

      afterAll(async () => {
        await  app.close();
      })

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should have the AuthorizerClient available', () => {
        const client = app.get(AUTHORIZER_CLIENT);
        expect(client).toBeDefined();
      });
    })
  });

});
