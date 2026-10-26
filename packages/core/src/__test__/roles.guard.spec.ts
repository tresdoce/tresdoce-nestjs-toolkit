import { HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasAnyRequiredRole, normalizeRoles, RolesGuard } from '../guards/roles.guard.js';

const mockExecutionContext = (userRoles: string[] | undefined) =>
  ({
    getClass: vi.fn(),
    getHandler: vi.fn(),
    switchToHttp: vi.fn(() => ({
      getRequest: vi.fn().mockReturnValue({
        user: userRoles === undefined ? undefined : { roles: userRoles },
      }),
    })),
  }) as any;

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    reflector = new Reflector();
    rolesGuard = new RolesGuard(reflector);
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  it('should allow access when the route is marked as @Public()', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    const context = mockExecutionContext(undefined);
    expect(rolesGuard.canActivate(context)).toBeTruthy();
  });

  it('should allow access when no roles are required', () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(undefined);
    const context = mockExecutionContext(['admin']);
    expect(rolesGuard.canActivate(context)).toBeTruthy();
  });

  it('should allow access when the user has one of the required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin', 'editor']);
    const context = mockExecutionContext(['editor']);
    expect(rolesGuard.canActivate(context)).toBeTruthy();
  });

  it('should throw an exception when the user has none of the required roles', () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin']);
    const context = mockExecutionContext(['viewer']);
    expect(() => rolesGuard.canActivate(context)).toThrow(
      new HttpException('Insufficient role', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception when the request has no authenticated user', () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin']);
    const context = mockExecutionContext(undefined);
    expect(() => rolesGuard.canActivate(context)).toThrow(
      new HttpException('Insufficient role', HttpStatus.FORBIDDEN),
    );
  });

  it('should read a single role from user.role, ignoring case and spaces', () => {
    vi.spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['Admin']);
    const context = {
      getClass: vi.fn(),
      getHandler: vi.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: ' ADMIN ' } }) }),
    } as any;
    expect(rolesGuard.canActivate(context)).toBe(true);
  });
});

describe('normalizeRoles', () => {
  it('should always return an array of trimmed, lowercase roles', () => {
    expect(normalizeRoles(' Admin ')).toEqual(['admin']);
    expect(normalizeRoles(['Editor', 2, null as unknown as string])).toEqual(['editor', '2']);
    expect(normalizeRoles(undefined)).toEqual([]);
  });
});

describe('hasAnyRequiredRole', () => {
  enum UserRole {
    Admin = 'ADMIN',
    User = 'USER',
  }

  it('should match roles from both user.roles and user.role', () => {
    expect(hasAnyRequiredRole({ roles: ['viewer'], role: 'admin' }, [UserRole.Admin])).toBe(true);
    expect(hasAnyRequiredRole({ roles: [UserRole.User] }, 'user')).toBe(true);
  });

  it('should return false without a user or without a matching role', () => {
    expect(hasAnyRequiredRole(undefined, 'admin')).toBe(false);
    expect(hasAnyRequiredRole({ role: 'viewer' }, ['admin'])).toBe(false);
  });
});
