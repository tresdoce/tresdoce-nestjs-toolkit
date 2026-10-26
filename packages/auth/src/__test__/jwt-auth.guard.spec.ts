import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

const mockExecutionContext = () =>
  ({
    getClass: vi.fn(),
    getHandler: vi.fn(),
    switchToHttp: vi.fn(() => ({
      getRequest: vi.fn().mockReturnValue({}),
      getResponse: vi.fn().mockReturnValue({}),
    })),
  }) as any;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when the route is marked as @Public()', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    expect(guard.canActivate(mockExecutionContext())).toBe(true);
  });

  it('should delegate to the passport AuthGuard when the route is not public', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);
    const superCanActivate = vi
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(mockExecutionContext())).toBe(true);
    expect(superCanActivate).toHaveBeenCalled();

    superCanActivate.mockRestore();
  });
});
