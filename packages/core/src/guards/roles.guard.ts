import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Solicitud autenticada con el usuario y sus roles adjuntos (convención estándar
 * de NestJS/Passport: `request.user`).
 */
export interface IRolesRequest {
  user?: {
    roles?: string[];
    [key: string]: any;
  };
}

/**
 * Guardia para restringir el acceso a rutas según los roles del usuario autenticado.
 * Lee los metadatos establecidos por `@Roles(...)` y `@Public()`.
 *
 * - Si la ruta (o su controlador) está marcada con `@Public()`, se permite el acceso
 *   sin más verificaciones.
 * - Si no se especificó ningún rol con `@Roles(...)`, se permite el acceso — la guardia
 *   es de habilitación explícita por ruta, no restrictiva por defecto.
 * - En caso contrario, se compara la lista de roles requeridos contra `request.user.roles`.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Determina si la ruta puede ser activada basándose en los roles del usuario.
   *
   * @param _context Contexto de ejecución de NestJS.
   * @returns True si el acceso está permitido, de lo contrario se lanza una excepción HTTP.
   * @throws {HttpException} Cuando el usuario no tiene ninguno de los roles requeridos.
   * @example
   * ```typescript
   * @Roles('admin')
   * @UseGuards(RolesGuard)
   * @Delete(':id')
   * removeItem(@Param('id') id: string) {
   *   // Lógica de borrado del ítem
   * }
   * ```
   */
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic: boolean = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      _context.getHandler(),
      _context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles: string[] = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      _context.getHandler(),
      _context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: IRolesRequest = _context.switchToHttp().getRequest<IRolesRequest>();
    const userRoles: string[] = request.user?.roles ?? [];

    const hasRole: boolean = requiredRoles.some((role: string) => userRoles.includes(role));

    if (!hasRole) {
      throw new HttpException('Insufficient role', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
