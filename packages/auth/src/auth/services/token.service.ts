import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { RedisService } from '@tresdoce-nestjs-toolkit/redis';
import { v4 as uuidv4 } from 'uuid';

import {
  AUTH_MODULE_OPTIONS,
  REFRESH_TOKEN_PREFIX,
  REFRESH_TOKEN_USER_INDEX_PREFIX,
} from '../constants/auth.constants';
import {
  AuthModuleOptions,
  IAuthTokens,
  IAuthenticatedUser,
  IJwtPayload,
} from '../interfaces/auth.interface';

const DEFAULT_ACCESS_TOKEN_TTL = '15m';
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
    });
  }

  /**
   * Emite un nuevo par access/refresh token para el usuario y persiste el
   * refresh token en Redis (valor + índice por usuario para poder revocar todos).
   */
  public async generateTokens(user: IAuthenticatedUser): Promise<IAuthTokens> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = uuidv4();
    const stored: IStoredRefreshToken = { userId: user.id, email: user.email, roles: user.roles };

    await this.redisService.set(
      this.refreshTokenKey(refreshToken),
      stored,
      this.refreshTokenTtlSeconds,
    );
    await this.redisService.clientRef.sAdd(this.userIndexKey(user.id), refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Rota el refresh token: el token presentado se invalida (uso único) y se
   * emite un par nuevo. Si el token no existe o ya fue usado/revocado, rechaza.
   */
  public async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
    const stored = (await this.redisService.get(
      this.refreshTokenKey(refreshToken),
    )) as IStoredRefreshToken | null;
    if (!stored) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.revokeRefreshToken(refreshToken, stored.userId);

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
