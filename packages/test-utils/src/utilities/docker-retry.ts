import { getContainerRuntimeClient } from 'testcontainers';

/**
 * Connection errors on the Docker socket that are worth retrying. They show up mostly on CI
 * runners, when the client reuses a keep-alive connection the daemon already closed (for example
 * right after stopping another container).
 */
const TRANSIENT_DOCKER_ERROR = /\b(EPIPE|ECONNRESET|socket hang up)\b/i;

export interface DockerRetryOptions {
  /** Total attempts, including the first one. Default: 3. */
  attempts?: number;
  /** Wait between attempts, in milliseconds. Default: 2000. */
  delayMs?: number;
  /** Runs before each retry (e.g. to remove a half-created container). */
  onRetry?: (error: unknown, attempt: number) => Promise<void> | void;
}

const describeError = (error: unknown): string =>
  error instanceof Error
    ? `${error.message} ${(error as NodeJS.ErrnoException).code ?? ''}`
    : typeof error === 'string'
      ? error
      : JSON.stringify(error);

/** True for transient Docker socket errors (`EPIPE`, `ECONNRESET`, `socket hang up`). */
export const isTransientDockerError = (error: unknown): boolean =>
  TRANSIENT_DOCKER_ERROR.test(describeError(error));

/**
 * Runs `fn` and retries it when it fails with a transient Docker socket error.
 * Any other error is thrown right away.
 */
export const retryOnTransientDockerError = <T>(
  fn: () => Promise<T>,
  { attempts = 3, delayMs = 2000, onRetry }: DockerRetryOptions = {},
): Promise<T> => {
  const run = (attempt: number): Promise<T> =>
    fn().catch(async (error: unknown) => {
      if (attempt >= attempts || !isTransientDockerError(error)) throw error;
      console.warn(
        `🔁 Transient Docker error (${describeError(error).trim()}), retrying (${attempt}/${attempts - 1})...`,
      );
      await onRetry?.(error, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return run(attempt + 1);
    });
  return run(1);
};

/** Force-removes the container with that name, if it exists. */
export const removeContainerByName = async (name: string): Promise<void> => {
  const client = await getContainerRuntimeClient();
  const found = (await client.container.list()).find((container) =>
    container.Names?.includes(`/${name}`),
  );
  if (found) await client.container.getById(found.Id).remove({ force: true, v: true });
};
