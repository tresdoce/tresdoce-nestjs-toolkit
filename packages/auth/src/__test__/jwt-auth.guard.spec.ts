import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const mockExecutionContext = () =>
  ({
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn().mockReturnValue({}),
      getResponse: jest.fn().mockReturnValue({}),
    })),
  }) as any;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when the route is marked as @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    expect(guard.canActivate(mockExecutionContext())).toBe(true);
  });

  it('should delegate to the passport AuthGuard when the route is not public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(false);
    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(mockExecutionContext())).toBe(true);
    expect(superCanActivate).toHaveBeenCalled();

    superCanActivate.mockRestore();
  });
});
