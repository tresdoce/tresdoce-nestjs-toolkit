import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RedisService } from '@tresdoce-nestjs-toolkit/redis';
import { randomUUID } from 'node:crypto';

import {
  AUTH_MODULE_OPTIONS,
  DEFAULT_ACCESS_TOKEN_TTL,
  DEFAULT_JWT_ALGORITHM,
  REFRESH_TOKEN_PREFIX,
  REFRESH_TOKEN_USER_INDEX_PREFIX,
} from '../constants/auth.constants.js';
import type {
  AuthModuleOptions,
  IAuthTokens,
  IAuthenticatedUser,
  IJwtPayload,
} from '../interfaces/auth.interface.js';

const DEFAULT_REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

interface IStoredRefreshToken {
  userId: string;
  email?: string;
  roles?: string[];
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    @Inject(AUTH_MODULE_OPTIONS) private readonly options: AuthModuleOptions,
  ) {}

  private get refreshTokenTtlSeconds(): number {
    return this.options.refreshTokenTtlSeconds ?? DEFAULT_REFRESH_TOKEN_TTL_SECONDS;
  }

  private refreshTokenKey(refreshToken: string): string {
    return `${REFRESH_TOKEN_PREFIX}:${refreshToken}`;
  }

  private userIndexKey(userId: string): string {
    return `${REFRESH_TOKEN_USER_INDEX_PREFIX}:${userId}`;
  }

  private signAccessToken(user: IAuthenticatedUser): string {
    const payload: IJwtPayload = { sub: user.id, email: user.email, roles: user.roles };
    return this.jwtService.sign(payload, {
      secret: this.options.jwtSecret,
      expiresIn: (this.options.accessTokenTtl ??
        DEFAULT_ACCESS_TOKEN_TTL) as JwtSignOptions['expiresIn'],
      algorithm: this.options.algorithm ?? DEFAULT_JWT_ALGORITHM,
    });
  }

  /**
   * Emite un nuevo par access/refresh token para el usuario y persiste el
   * refresh token en Redis (valor + índice por usuario para poder revocar todos).
   */
  public async generateTokens(user: IAuthenticatedUser): Promise<IAuthTokens> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = randomUUID();
    const stored: IStoredRefreshToken = { userId: user.id, email: user.email, roles: user.roles };

    await this.redisService.set(
      this.refreshTokenKey(refreshToken),
      stored,
      this.refreshTokenTtlSeconds,
    );
    const indexKey = this.userIndexKey(user.id);
    await this.redisService.clientRef.sAdd(indexKey, refreshToken);
    // El índice vive lo mismo que el refresh token más reciente, así no queda huérfano en Redis.
    await this.redisService.clientRef.expire(indexKey, this.refreshTokenTtlSeconds);

    return { accessToken, refreshToken };
  }

  /**
   * Rota el refresh token: el token presentado se invalida (uso único) y se
   * emite un par nuevo. Si el token no existe o ya fue usado/revocado, rechaza.
   * Solo el request que efectivamente borra la key gana la rotación: dos canjes
   * concurrentes del mismo token no emiten dos pares.
   */
  public async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
    const key = this.refreshTokenKey(refreshToken);
    const stored = (await this.redisService.get(key)) as IStoredRefreshToken | null;
    if (!stored || !(await this.redisService.del(key))) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.redisService.clientRef.sRem(this.userIndexKey(stored.userId), refreshToken);

    return this.generateTokens({ id: stored.userId, email: stored.email, roles: stored.roles });
  }

  /**
   * Revoca un refresh token puntual. `userId` es opcional como optimización
   * para no pegarle a Redis dos veces cuando el caller ya lo conoce (ej. refreshTokens).
   */
  public async revokeRefreshToken(refreshToken: string, userId?: string): Promise<void> {
    const ownerId =
      userId ??
      (
        (await this.redisService.get(
          this.refreshTokenKey(refreshToken),
        )) as IStoredRefreshToken | null
      )?.userId;

    await this.redisService.del(this.refreshTokenKey(refreshToken));
    if (ownerId) {
      await this.redisService.clientRef.sRem(this.userIndexKey(ownerId), refreshToken);
    }
  }

  /**
   * Revoca todos los refresh tokens vigentes de un usuario (ej. logout global,
   * cambio de contraseña, baneo).
   */
  public async revokeAllForUser(userId: string): Promise<void> {
    const tokens = await this.redisService.clientRef.sMembers(this.userIndexKey(userId));
    await Promise.all(tokens.map((token) => this.redisService.del(this.refreshTokenKey(token))));
    await this.redisService.del(this.userIndexKey(userId));
  }
}
