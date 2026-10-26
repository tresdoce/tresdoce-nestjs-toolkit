import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_MODULE_OPTIONS, DEFAULT_JWT_ALGORITHM } from '../constants/auth.constants.js';
import type {
  AuthModuleOptions,
  IAuthenticatedUser,
  IJwtPayload,
} from '../interfaces/auth.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AUTH_MODULE_OPTIONS) options: AuthModuleOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.jwtSecret,
      // Only accept the algorithm the module signs with (blocks algorithm confusion).
      algorithms: [options.algorithm ?? DEFAULT_JWT_ALGORITHM],
    });
  }

  /**
   * Lo que devuelve este método es lo que Passport asigna a `request.user`.
   * Mapea `sub` -> `id` para no filtrar el nombre de campo JWT al resto de la app,
   * y preserva `roles` para que `RolesGuard` (de `@tresdoce-nestjs-toolkit/core`)
   * pueda leerlo directamente. Rechaza tokens sin `sub`. Los claims extra se copian
   * primero para que un claim `id`/`email`/`roles` arbitrario no pise los valores mapeados.
   */
  validate(payload: IJwtPayload): IAuthenticatedUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    const { sub, email, roles, ...rest } = payload;
    return { ...rest, id: sub, email, roles };
  }
}
