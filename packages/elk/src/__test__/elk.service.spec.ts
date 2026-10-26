import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from '@tresdoce-nestjs-toolkit/test-utils';
import { lastValueFrom, of, throwError } from 'rxjs';

import { ElkModule } from '../elk/elk.module.js';
import { ElkInterceptor } from '../elk/interceptors/elk.interceptor.js';
import { ElkService } from '../elk/services/elk.service.js';
import { ELK_MSG_ERROR_CONNECTED } from '../elk/constants/elk.constant.js';

const mocks = vi.hoisted(() => ({
  clientOptions: [] as any[],
  info: vi.fn(),
  index: vi.fn(),
}));

vi.mock('@elastic/elasticsearch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@elastic/elasticsearch')>();
  return {
    ...actual,
    Client: vi.fn(function (options) {
      mocks.clientOptions.push(options);
      return {
        info: mocks.info,
        index: mocks.index,
        close: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

const buildContext = (path = '/users', statusCode = 200): any => ({
  switchToHttp: () => ({
    getRequest: () => ({
      path,
      url: `${path}?page=1`,
      method: 'POST',
      params: {},
      query: { page: '1' },
      body: { password: 'secret' },
      headers: { authorization: 'Bearer abc' },
      cookies: {},
    }),
    getResponse: () => ({
      statusCode,
      getHeaders: () => ({ 'content-type': 'application/json' }),
    }),
  }),
  getType: () => 'http',
  getClass: () => ({ name: 'UsersController' }),
  getHandler: () => ({ name: 'create' }),
});

const flush = () => new Promise((resolve) => setImmediate(resolve));

describe('ElkService', () => {
  let moduleFixture: TestingModule;
  let elkService: ElkService;

  const createModule = async (indexDate: boolean) => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [config] }),
        ElkModule.register({
          name: 'my-app',
          indexDate,
          node: 'http://localhost:9200',
          redact: { paths: ['body.password', 'headers.request.authorization'], censor: '****' },
        }),
      ],
    }).compile();
    await moduleFixture.init();
    elkService = moduleFixture.get<ElkService>(ElkService);
  };

  beforeEach(() => {
    mocks.clientOptions.length = 0;
    mocks.info.mockReset().mockResolvedValue({ name: 'es01' });
    mocks.index.mockReset().mockResolvedValue({});
  });

  afterEach(async () => {
    await moduleFixture?.close();
    vi.restoreAllMocks();
  });

  it('should not pass toolkit-only options (indexDate, redact) to the Client', async () => {
    await createModule(true);
    const options = mocks.clientOptions[0];
    expect(options.node).toBe('http://localhost:9200');
    expect(options).not.toHaveProperty('indexDate');
    expect(options).not.toHaveProperty('redact');
    expect(typeof options.generateRequestId()).toBe('string');
  });

  it('should log an error when the connection check fails', async () => {
    const spyLogger = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
    mocks.info.mockRejectedValue(new Error('connect ECONNREFUSED'));
    await createModule(true);
    await flush();
    expect(spyLogger).toHaveBeenCalledWith(
      `${ELK_MSG_ERROR_CONNECTED} connect ECONNREFUSED`,
      'ElkModule',
    );
  });

  it('should index a redacted document with date suffix', async () => {
    await createModule(true);
    await elkService.serializeResponseInterceptor(Date.now(), buildContext(), { id: 1 }, false);

    expect(mocks.index).toHaveBeenCalledTimes(1);
    const [{ index, id, document }] = mocks.index.mock.calls[0];
    expect(index).toMatch(/^my-app-\d{4}\.\d{2}\.\d{2}$/);
    expect(typeof id).toBe('string');
    expect(document.controller).toBe('UsersController');
    expect(document.handler).toBe('create');
    expect(document.statusCode).toBe(200);
    expect(document.response).toBe(JSON.stringify({ id: 1 }));
    expect(JSON.parse(document.body).password).not.toBe('secret');
    expect(JSON.parse(document.headers).request.authorization).not.toBe('Bearer abc');
  });

  it('should index without date suffix and with the exception payload', async () => {
    await createModule(false);
    await elkService.serializeResponseInterceptor(
      Date.now(),
      buildContext(),
      new HttpException('not found', 404),
      true,
    );

    const [{ index, document }] = mocks.index.mock.calls[0];
    expect(index).toBe('my-app');
    expect(document.statusCode).toBe(404);
    expect(JSON.parse(document.response).error.status).toBe(404);
    expect(JSON.parse(document.headers).response).toEqual({});
  });

  it('should log and not throw when indexing fails', async () => {
    const spyLogger = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
    await createModule(true);
    mocks.index.mockRejectedValue(new Error('index_not_found'));

    await expect(elkService.createIndexDocument({ a: 1 }, 'audit')).resolves.toBeUndefined();
    expect(mocks.index.mock.calls[0][0].index).toMatch(/^my-app-audit-/);
    expect(spyLogger).toHaveBeenCalledWith('Create document: index_not_found', 'ElkModule');
  });

  describe('ElkInterceptor', () => {
    it('should index on success and on error without altering the stream', async () => {
      await createModule(true);
      const interceptor = new ElkInterceptor(elkService);
      const spy = vi.spyOn(elkService, 'serializeResponseInterceptor');

      await expect(
        lastValueFrom(interceptor.intercept(buildContext(), { handle: () => of('ok') })),
      ).resolves.toBe('ok');

      const error = new Error('boom');
      await expect(
        lastValueFrom(
          interceptor.intercept(buildContext(), { handle: () => throwError(() => error) }),
        ),
      ).rejects.toBe(error);

      expect(spy).toHaveBeenNthCalledWith(1, expect.any(Number), expect.anything(), 'ok', false);
      expect(spy).toHaveBeenNthCalledWith(2, expect.any(Number), expect.anything(), error, true);
    });

    it('should log serialization errors instead of leaking unhandled rejections', async () => {
      const spyLogger = vi.spyOn(Logger, 'error').mockImplementation(() => undefined);
      await createModule(true);
      const interceptor = new ElkInterceptor(elkService);
      vi.spyOn(elkService, 'serializeResponseInterceptor').mockRejectedValue(new Error('fail'));

      await lastValueFrom(interceptor.intercept(buildContext(), { handle: () => of('ok') }));
      await flush();

      expect(spyLogger).toHaveBeenCalledWith('Serialize response: fail', 'ElkInterceptor');
    });
  });
});
