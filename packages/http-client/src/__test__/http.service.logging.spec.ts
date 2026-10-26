import type { AxiosInstance } from 'axios';
import type { LoggingService } from '@tresdoce-nestjs-toolkit/logger';

import { HttpClientService } from '../http/services/httpClient.service.js';

const createAxiosMock = (request: ReturnType<typeof vi.fn>) =>
  ({
    request,
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  }) as unknown as AxiosInstance;

const createLoggerMock = () =>
  ({
    getGenericLog: vi.fn((level: string, logType: string) => ({
      log_level: level.toUpperCase(),
      log_type: logType,
    })),
    log: vi.fn(),
    error: vi.fn(),
  }) as unknown as LoggingService & {
    log: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

describe('HttpClientService - outgoing request logs', () => {
  it('should log a successful request without query string, headers or body', async () => {
    const logger = createLoggerMock();
    const service = new HttpClientService(
      createAxiosMock(vi.fn().mockResolvedValue({ status: 200, data: {} })),
      [],
      logger,
    );

    await service.post('https://api.test/users?token=secret', { data: { password: 'x' } });

    expect(logger.log).toHaveBeenCalledTimes(1);
    const [log, context] = logger.log.mock.calls[0];
    expect(context).toBe('HttpClientService');
    expect(log).toMatchObject({
      log_type: 'OUTGOING_REQUEST',
      message: 'Outgoing request executed',
      outgoing_http_request_method: 'POST',
      outgoing_http_request_address: 'https://api.test/users',
      outgoing_http_response_status_code: 200,
    });
    expect(JSON.stringify(log)).not.toContain('secret');
    expect(JSON.stringify(log)).not.toContain('password');
  });

  it('should log a failed request as an error and rethrow it', async () => {
    const logger = createLoggerMock();
    const failure = Object.assign(new Error('Request failed'), { response: { status: 503 } });
    const service = new HttpClientService(
      createAxiosMock(vi.fn().mockRejectedValue(failure)),
      [],
      logger,
    );

    await expect(service.get('https://api.test/health')).rejects.toBe(failure);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Outgoing request failed: Request failed',
        outgoing_http_request_method: 'GET',
        outgoing_http_response_status_code: 503,
      }),
      'HttpClientService',
    );
  });

  it('should log non-Error failures without a status code', async () => {
    const logger = createLoggerMock();
    const service = new HttpClientService(
      createAxiosMock(vi.fn().mockRejectedValue('boom')),
      [],
      logger,
    );

    await expect(service.request({ url: 'https://api.test' })).rejects.toBe('boom');

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Outgoing request failed: boom',
        outgoing_http_request_method: 'GET',
        outgoing_http_response_status_code: '-',
      }),
      'HttpClientService',
    );
  });

  it('should not fail when LoggingModule is not registered', async () => {
    const service = new HttpClientService(
      createAxiosMock(vi.fn().mockResolvedValue({ status: 204 })),
      [],
    );

    await expect(service.delete('https://api.test/users/1')).resolves.toEqual({ status: 204 });
  });

  it('should strip credentials and fragment from the logged address', async () => {
    const logger = createLoggerMock();
    const service = new HttpClientService(
      createAxiosMock(vi.fn().mockResolvedValue({ status: 200 })),
      [],
      logger,
    );

    await service.get('https://user:pass@api.test/users#section');

    expect(logger.log.mock.calls[0][0]).toMatchObject({
      outgoing_http_request_address: 'https://api.test/users',
    });
  });

  it('should not encode an undefined url and log the baseURL instead', async () => {
    const logger = createLoggerMock();
    const request = vi.fn().mockResolvedValue({ status: 200 });
    const service = new HttpClientService(createAxiosMock(request), [], logger);

    await service.request({ baseURL: 'https://api.test/base?key=secret' });
    await service.request({});

    expect(request.mock.calls[0][0].url).toBeUndefined();
    expect(logger.log.mock.calls[0][0]).toMatchObject({
      outgoing_http_request_address: 'https://api.test/base',
    });
    expect(logger.log.mock.calls[1][0]).toMatchObject({ outgoing_http_request_address: '-' });
  });
});

describe('HttpClientService - header propagation', () => {
  it('should propagate configured headers regardless of their case', async () => {
    const request = vi.fn().mockResolvedValue({ status: 200 });
    const service = new HttpClientService(createAxiosMock(request), ['X-Custom-Header']);

    service.initAxios({
      headers: { 'x-custom-header': 'value', 'uber-trace-id': 'trace', other: 'nope' },
      ip: '127.0.0.1',
    } as any);
    await service.get('https://api.test');

    const { headers } = request.mock.calls[0][0];
    expect(headers).toMatchObject({ 'x-custom-header': 'value', 'uber-trace-id': 'trace' });
    expect(headers).not.toHaveProperty('other');
  });
});
