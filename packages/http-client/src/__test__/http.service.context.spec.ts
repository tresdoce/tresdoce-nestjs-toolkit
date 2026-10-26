import { AsyncResource } from 'node:async_hooks';
import type { AxiosInstance } from 'axios';

import { HttpClientService } from '../http/services/httpClient.service.js';

const createAxiosMock = (request: ReturnType<typeof vi.fn>) =>
  ({
    request,
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  }) as unknown as AxiosInstance;

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

// Each incoming HTTP request runs in its own async context; AsyncResource reproduces that.
const asIncomingRequest = <T>(fn: () => Promise<T>): Promise<T> =>
  new AsyncResource('INCOMING_REQUEST').runInAsyncScope(fn);

describe('HttpClientService - per-request context', () => {
  it('should not mix propagated headers between concurrent requests', async () => {
    const request = vi.fn().mockResolvedValue({ status: 200 });
    const service = new HttpClientService(createAxiosMock(request), ['x-request-id']);

    const handle = (requestId: string, waitBeforeCall: number) =>
      asIncomingRequest(async () => {
        service.initAxios({ headers: { 'x-request-id': requestId }, ip: requestId } as any);
        for (let i = 0; i < waitBeforeCall; i++) await tick();
        await service.get(`https://api.test/${requestId}`);
      });

    // "a" initializes first but calls last, so "b" initializes in between.
    await Promise.all([handle('a', 3), handle('b', 1)]);

    const sentHeaders = Object.fromEntries(
      request.mock.calls.map(([config]) => [config.url, config.headers['x-request-id']]),
    );
    expect(sentHeaders).toEqual({ 'https://api.test/a': 'a', 'https://api.test/b': 'b' });
  });

  it('should only send the default headers outside an incoming request', async () => {
    const request = vi.fn().mockResolvedValue({ status: 200 });
    const service = new HttpClientService(createAxiosMock(request), ['x-request-id']);

    await asIncomingRequest(async () => {
      service.initAxios({ headers: { 'x-request-id': 'inside' }, ip: '10.0.0.1' } as any);
    });
    await asIncomingRequest(() => service.get('https://api.test/cron'));

    const { headers } = request.mock.calls[0][0];
    expect(headers).not.toHaveProperty('x-request-id');
    expect(headers).toMatchObject({ 'Content-Type': 'application/json' });
  });
});
