import type { Mock, Mocked } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '@tresdoce-nestjs-toolkit/redis';

import { AuthModuleOptions, IAuthenticatedUser } from '../auth/interfaces/auth.interface.js';
import { TokenService } from '../auth/services/token.service.js';

vi.mock('node:crypto', async () => ({
  ...(await vi.importActual<typeof import('node:crypto')>('node:crypto')),
  randomUUID: vi.fn(() => 'generated-refresh-token'),
}));

describe('TokenService', () => {
  let service: TokenService;
  let jwtService: Mocked<JwtService>;
  let redisService: Mocked<RedisService>;
  let clientRef: { sAdd: Mock; sRem: Mock; sMembers: Mock; expire: Mock };

  const options: AuthModuleOptions = { jwtSecret: 'test-secret' };
  const user: IAuthenticatedUser = { id: 'user-1', email: 'user@test.com', roles: ['admin'] };

  beforeEach(() => {
    clientRef = {
      sAdd: vi.fn().mockResolvedValue(1),
      sRem: vi.fn().mockResolvedValue(1),
      sMembers: vi.fn().mockResolvedValue([]),
      expire: vi.fn().mockResolvedValue(1),
    };

    jwtService = { sign: vi.fn().mockReturnValue('signed-access-token') } as any;
    redisService = {
      set: vi.fn().mockResolvedValue('OK'),
      get: vi.fn().mockResolvedValue(null),
      del: vi.fn().mockResolvedValue(true),
      get clientRef() {
        return clientRef;
      },
    } as any;

    service = new TokenService(jwtService, redisService, options);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should sign an access token and persist a new refresh token indexed by user', async () => {
      const tokens = await service.generateTokens(user);

      expect(tokens).toEqual({
        accessToken: 'signed-access-token',
        refreshToken: 'generated-refresh-token',
      });
      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, roles: user.roles },
        { secret: options.jwtSecret, expiresIn: '15m', algorithm: 'HS256' },
      );
      expect(redisService.set).toHaveBeenCalledWith(
        'auth:refresh:generated-refresh-token',
        { userId: user.id, email: user.email, roles: user.roles },
        60 * 60 * 24 * 7,
      );
      expect(clientRef.sAdd).toHaveBeenCalledWith(
        'auth:refresh:user:user-1',
        'generated-refresh-token',
      );
      expect(clientRef.expire).toHaveBeenCalledWith('auth:refresh:user:user-1', 60 * 60 * 24 * 7);
    });

    it('should honor custom TTLs from module options', async () => {
      service = new TokenService(jwtService, redisService, {
        ...options,
        accessTokenTtl: '1h',
        refreshTokenTtlSeconds: 3600,
      });

      await service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenCalledWith(expect.anything(), {
        secret: options.jwtSecret,
        expiresIn: '1h',
        algorithm: 'HS256',
      });
      expect(redisService.set).toHaveBeenCalledWith(expect.anything(), expect.anything(), 3600);
      expect(clientRef.expire).toHaveBeenCalledWith('auth:refresh:user:user-1', 3600);
    });
  });

  describe('refreshTokens', () => {
    it('should rotate a valid refresh token and issue a new pair', async () => {
      (redisService.get as Mock).mockResolvedValueOnce({
        userId: user.id,
        email: user.email,
        roles: user.roles,
      });

      const tokens = await service.refreshTokens('old-refresh-token');

      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:old-refresh-token');
      expect(clientRef.sRem).toHaveBeenCalledWith('auth:refresh:user:user-1', 'old-refresh-token');
      expect(tokens).toEqual({
        accessToken: 'signed-access-token',
        refreshToken: 'generated-refresh-token',
      });
    });

    it('should reject an unknown or expired refresh token', async () => {
      (redisService.get as Mock).mockResolvedValueOnce(null);

      await expect(service.refreshTokens('missing-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should reject when the token was already consumed by a concurrent refresh', async () => {
      (redisService.get as Mock).mockResolvedValueOnce({ userId: user.id });
      (redisService.del as Mock).mockResolvedValueOnce(false);

      await expect(service.refreshTokens('raced-token')).rejects.toThrow(UnauthorizedException);
      expect(clientRef.sRem).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete the token and remove it from the user index when userId is known', async () => {
      await service.revokeRefreshToken('some-token', 'user-1');

      expect(redisService.get).not.toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:some-token');
      expect(clientRef.sRem).toHaveBeenCalledWith('auth:refresh:user:user-1', 'some-token');
    });

    it('should look up the owner when userId is not provided', async () => {
      (redisService.get as Mock).mockResolvedValueOnce({ userId: 'user-2' });

      await service.revokeRefreshToken('some-token');

      expect(redisService.get).toHaveBeenCalledWith('auth:refresh:some-token');
      expect(clientRef.sRem).toHaveBeenCalledWith('auth:refresh:user:user-2', 'some-token');
    });

    it('should skip the index cleanup when the token has no known owner', async () => {
      (redisService.get as Mock).mockResolvedValueOnce(null);

      await service.revokeRefreshToken('orphan-token');

      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:orphan-token');
      expect(clientRef.sRem).not.toHaveBeenCalled();
    });
  });

  describe('revokeAllForUser', () => {
    it('should delete every refresh token tracked for the user and the index itself', async () => {
      clientRef.sMembers.mockResolvedValueOnce(['token-a', 'token-b']);

      await service.revokeAllForUser('user-1');

      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:token-a');
      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:token-b');
      expect(redisService.del).toHaveBeenCalledWith('auth:refresh:user:user-1');
    });
  });
});
