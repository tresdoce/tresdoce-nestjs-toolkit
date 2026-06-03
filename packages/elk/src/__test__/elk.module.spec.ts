import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config, dynamicConfig } from '@tresdoce-nestjs-toolkit/test-utils';
import { HttpConnection } from '@elastic/elasticsearch';
import { URL } from 'url';

import { ElkModule } from '../elk/elk.module';
import { ElkInterceptor } from '../elk/interceptors/elk.interceptor';
import { ElkService } from '../elk/services/elk.service';

jest.mock('@elastic/elasticsearch', () => {
  const actual = jest.requireActual('@elastic/elasticsearch');

  return {
    ...actual,
    Client: jest.fn().mockImplementation((options) => ({
      name: options.name,
      requestId: options.generateRequestId(),
      info: jest.fn().mockResolvedValue({ name: options.name }),
      index: jest.fn().mockResolvedValue({}),
      close: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

const elkIndexName = `test-elasticsearch`;

jest.setTimeout(90000);
describe('ElkModule', () => {
  let app: INestApplication;
  let elkService: ElkService;
  let interceptor: ElkInterceptor<any>;

  describe('With indexDate', () => {
    describe('forRoot', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig({
                  elasticsearch: {
                    name: `${elkIndexName}`,
                    indexDate: true,
                    node: {
                      url: new URL(`http://localhost:9200`),
                    },
                    redact: {
                      paths: ['headers.request.apiKey'],
                      censor: 'XXXX',
                    },
                    maxRetries: 10,
                    requestTimeout: 90000,
                    sniffOnStart: false,
                    Connection: HttpConnection,
                  },
                }),
              ],
            }),
            ElkModule,
          ],
        }).compile();
        app = moduleFixture.createNestApplication();
        interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
        app.useGlobalInterceptors(interceptor);
        elkService = moduleFixture.get<ElkService>(ElkService);
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should be return client ref', async () => {
        const clientRef = elkService.clientRef;
        expect(clientRef).toBeDefined();
        expect(clientRef.name).toEqual(`${elkIndexName}`);
      });
    });

    describe('register', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [config],
            }),
            ElkModule.register({
              name: `${elkIndexName}`,
              indexDate: true,
              node: {
                url: new URL(`http://localhost:9200`),
              },
              maxRetries: 10,
              requestTimeout: 90000,
              sniffOnStart: false,
              Connection: HttpConnection,
            }),
          ],
        }).compile();
        app = moduleFixture.createNestApplication();
        interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
        app.useGlobalInterceptors(interceptor);
        elkService = moduleFixture.get<ElkService>(ElkService);
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should be return client ref', async () => {
        const clientRef = elkService.clientRef;
        expect(clientRef).toBeDefined();
        expect(clientRef.name).toEqual(`${elkIndexName}`);
      });
    });
  });

  describe('Without indexDate', () => {
    describe('forRoot', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [
                dynamicConfig({
                  elasticsearch: {
                    name: `${elkIndexName}`,
                    indexDate: false,
                    node: {
                      url: new URL(`http://localhost:9200`),
                    },
                    redact: {
                      paths: ['headers.request.apiKey'],
                      censor: 'XXXX',
                    },
                    maxRetries: 10,
                    requestTimeout: 90000,
                    sniffOnStart: false,
                    Connection: HttpConnection,
                  },
                }),
              ],
            }),
            ElkModule,
          ],
        }).compile();
        app = moduleFixture.createNestApplication();
        interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
        app.useGlobalInterceptors(interceptor);
        elkService = moduleFixture.get<ElkService>(ElkService);
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should be return client ref', async () => {
        const clientRef = elkService.clientRef;
        expect(clientRef).toBeDefined();
        expect(clientRef.name).toEqual(`${elkIndexName}`);
      });
    });

    describe('register', () => {
      beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [
            ConfigModule.forRoot({
              isGlobal: true,
              load: [config],
            }),
            ElkModule.register({
              name: `${elkIndexName}`,
              indexDate: false,
              node: {
                url: new URL(`http://localhost:9200`),
              },
              maxRetries: 10,
              requestTimeout: 90000,
              sniffOnStart: false,
              Connection: HttpConnection,
            }),
          ],
        }).compile();
        app = moduleFixture.createNestApplication();
        interceptor = new ElkInterceptor(app.get<ElkService>(ElkService));
        app.useGlobalInterceptors(interceptor);
        elkService = moduleFixture.get<ElkService>(ElkService);
        await app.init();
      });

      afterEach(async () => {
        await app.close();
      });

      it('should be defined', () => {
        expect(app).toBeDefined();
      });

      it('should be return client ref', async () => {
        const clientRef = elkService.clientRef;
        expect(clientRef).toBeDefined();
        expect(clientRef.name).toEqual(`${elkIndexName}`);
      });
    });
  });
});
