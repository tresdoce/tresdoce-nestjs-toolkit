const { listMock, removeMock, getByIdMock } = vi.hoisted(() => {
  const removeMock = vi.fn();
  return {
    listMock: vi.fn(),
    removeMock,
    getByIdMock: vi.fn(() => ({ remove: removeMock })),
  };
});

vi.mock('testcontainers', () => ({
  getContainerRuntimeClient: vi.fn(async () => ({
    container: { list: listMock, getById: getByIdMock },
  })),
}));

import {
  isTransientDockerError,
  removeContainerByName,
  retryOnTransientDockerError,
} from '../utilities/docker-retry.js';

const epipe = Object.assign(new Error('write EPIPE'), { code: 'EPIPE' });

describe('docker-retry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  describe('isTransientDockerError', () => {
    it.each([
      [epipe, true],
      [Object.assign(new Error('read'), { code: 'ECONNRESET' }), true],
      [new Error('socket hang up'), true],
      ['write EPIPE', true],
      [{ code: 'EPIPE' }, true],
      [{ reason: 'busy' }, false],
      [new Error('Conflict. The container name is already in use'), false],
      [new Error('pull access denied'), false],
    ])('should classify %s as %s', (error, expected) => {
      expect(isTransientDockerError(error)).toBe(expected);
    });
  });

  describe('retryOnTransientDockerError', () => {
    it('should return the result when the first attempt succeeds', async () => {
      const fn = vi.fn().mockResolvedValue('started');
      await expect(retryOnTransientDockerError(fn, { delayMs: 0 })).resolves.toBe('started');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry transient errors and run onRetry before each retry', async () => {
      const fn = vi.fn().mockRejectedValueOnce(epipe).mockResolvedValue('started');
      const onRetry = vi.fn();

      await expect(retryOnTransientDockerError(fn, { delayMs: 0, onRetry })).resolves.toBe(
        'started',
      );
      expect(fn).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(epipe, 1);
    });

    it('should throw non-transient errors right away', async () => {
      const conflict = new Error('Conflict');
      const fn = vi.fn().mockRejectedValue(conflict);

      await expect(retryOnTransientDockerError(fn, { delayMs: 0 })).rejects.toBe(conflict);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should give up after the configured attempts', async () => {
      const fn = vi.fn().mockRejectedValue(epipe);

      await expect(retryOnTransientDockerError(fn, { attempts: 2, delayMs: 0 })).rejects.toBe(
        epipe,
      );
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use the default attempts and delay', async () => {
      vi.useFakeTimers();
      const fn = vi.fn().mockRejectedValueOnce(epipe).mockResolvedValue('ok');

      const result = retryOnTransientDockerError(fn);
      await vi.advanceTimersByTimeAsync(2000);

      await expect(result).resolves.toBe('ok');
      vi.useRealTimers();
    });
  });

  describe('removeContainerByName', () => {
    it('should force-remove the container with that name', async () => {
      listMock.mockResolvedValue([
        { Id: 'a1', Names: ['/other'] },
        { Id: 'b2', Names: ['/tresdoce-test-container-mongo'] },
      ]);

      await removeContainerByName('tresdoce-test-container-mongo');

      expect(getByIdMock).toHaveBeenCalledWith('b2');
      expect(removeMock).toHaveBeenCalledWith({ force: true, v: true });
    });

    it('should do nothing when no container has that name', async () => {
      listMock.mockResolvedValue([{ Id: 'a1' }]);

      await removeContainerByName('missing');

      expect(removeMock).not.toHaveBeenCalled();
    });
  });
});
