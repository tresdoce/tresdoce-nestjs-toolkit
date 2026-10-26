import { UnauthorizedException } from '@nestjs/common';

import { JwtStrategy } from '../auth/strategies/jwt.strategy.js';
import { IJwtPayload } from '../auth/interfaces/auth.interface.js';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy({ jwtSecret: 'test-secret' });
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should map the JWT payload to an authenticated user', () => {
    const payload: IJwtPayload = { sub: 'user-1', email: 'user@test.com', roles: ['admin'] };
    expect(strategy.validate(payload)).toEqual({
      id: 'user-1',
      email: 'user@test.com',
      roles: ['admin'],
    });
  });

  it('should carry over extra claims from the payload', () => {
    const payload: IJwtPayload = { sub: 'user-1', tenant: 'acme' };
    expect(strategy.validate(payload)).toEqual({
      id: 'user-1',
      email: undefined,
      roles: undefined,
      tenant: 'acme',
    });
  });

  it('should not let extra claims override the mapped fields', () => {
    const payload: IJwtPayload = { sub: 'user-1', id: 'spoofed', roles: ['user'] };
    expect(strategy.validate(payload)).toEqual({ id: 'user-1', email: undefined, roles: ['user'] });
  });

  it('should reject a payload without "sub"', () => {
    expect(() => strategy.validate({} as IJwtPayload)).toThrow(UnauthorizedException);
  });
});
