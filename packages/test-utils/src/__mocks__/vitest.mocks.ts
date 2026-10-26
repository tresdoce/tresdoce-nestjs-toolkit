import { type Mock, vi } from 'vitest';
import { appConfigBase } from '../fixtures/appConfigBase.js';

/**
 * Mock function that returns `appConfigBase` (e.g. as `ConfigService#get`).
 */
export const config = (): Mock<() => typeof appConfigBase> =>
  vi.fn<() => typeof appConfigBase>(() => appConfigBase);

/**
 * Chainable mock of Nest's `ExecutionContext`: every method returns the context itself,
 * so `context.switchToHttp().getRequest()` works out of the box.
 */
export const executionContext: any = () => ({
  switchToHttp: vi.fn<() => any>().mockReturnThis(),
  getRequest: vi.fn<() => any>().mockReturnThis(),
  getResponse: vi.fn<() => any>().mockReturnThis(),
  getType: vi.fn<() => any>().mockReturnThis(),
  getClass: vi.fn<() => any>().mockReturnThis(),
  getHandler: vi.fn<() => any>().mockReturnThis(),
});
