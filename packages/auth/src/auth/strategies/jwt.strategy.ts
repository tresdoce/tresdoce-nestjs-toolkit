import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTH_MODULE_OPTIONS } from '../constants/auth.constants';
import { AuthModuleOptions, IAuthenticatedUser, IJwtPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AUTH_MODULE_OPTIONS) options: AuthModuleOptions) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: options.jwtSecret,
    });
  }

  /**
   * Lo que devuelve este método es lo que Passport asigna a `request.user`.
   * Mapea `sub` -> `id` para no filtrar el nombre de campo JWT al resto de la app,
   * y preserva `roles` para que `RolesGuard` (de `@tresdoce-nestjs-toolkit/core`)
   * pueda leerlo directamente.
   */
  validate(payload: IJwtPayload): IAuthenticatedUser {
    const { sub, email, roles, ...rest } = payload;
    return { id: sub, email, roles, ...rest };
  }
}
