import { HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';

const mockExecutionContext = (userRoles: string[] | undefined) =>
  ({
    getClass: jest.fn(),
    getHandler: jest.fn(),
    switchToHttp: jest.fn(() => ({
      getRequest: jest.fn().mockReturnValue({
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
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  it('should allow access when the route is marked as @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(true);
    const context = mockExecutionContext(undefined);
    expect(rolesGuard.canActivate(context)).toBeTruthy();
  });

  it('should allow access when no roles are required', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(undefined);
    const context = mockExecutionContext(['admin']);
    expect(rolesGuard.canActivate(context)).toBeTruthy();
  });

  it('should allow access when the user has one of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin', 'editor']);
    const context = mockExecutionContext(['editor']);
    expect(rolesGuard.canActivate(context)).toBeTruthy();
  });

  it('should throw an exception when the user has none of the required roles', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin']);
    const context = mockExecutionContext(['viewer']);
    expect(() => rolesGuard.canActivate(context)).toThrow(
      new HttpException('Insufficient role', HttpStatus.FORBIDDEN),
    );
  });

  it('should throw an exception when the request has no authenticated user', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(['admin']);
    const context = mockExecutionContext(undefined);
    expect(() => rolesGuard.canActivate(context)).toThrow(
      new HttpException('Insufficient role', HttpStatus.FORBIDDEN),
    );
  });
});
