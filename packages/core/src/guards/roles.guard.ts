import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/** Un rol puede venir como string o como valor de un enum (string o numérico). */
export type RoleLike = string | number;

/** Un único rol o una lista de roles. */
export type RolesLike = RoleLike | RoleLike[];

/**
 * Solicitud autenticada con el usuario y sus roles adjuntos (convención estándar
 * de NestJS/Passport: `request.user`). Se aceptan tanto `roles` como `role`.
 */
export interface IRolesRequest {
  user?: {
    roles?: RolesLike;
    role?: RolesLike;
    [key: string]: any;
  };
}

/**
 * Normaliza uno o varios roles a strings en minúsculas y sin espacios.
 * Siempre devuelve un array; ignora valores `null`/`undefined`.
 */
export const normalizeRoles = (input: RolesLike | null | undefined): string[] => {
  const roles = Array.isArray(input) ? input : [input];
  return roles.filter((role) => role != null).map((role) => String(role).trim().toLowerCase());
};

/**
 * Indica si el usuario posee al menos uno de los roles requeridos.
 * La comparación no distingue mayúsculas de minúsculas.
 */
export const hasAnyRequiredRole = (
  user: IRolesRequest['user'] | undefined,
  requiredRoles: RolesLike,
): boolean => {
  if (!user) return false;
  const userRoles = new Set([...normalizeRoles(user.roles), ...normalizeRoles(user.role)]);
  return normalizeRoles(requiredRoles).some((role) => userRoles.has(role));
};

/**
 * Guardia para restringir el acceso a rutas según los roles del usuario autenticado.
 * Lee los metadatos establecidos por `@Roles(...)` y `@Public()`.
 *
 * - Si la ruta (o su controlador) está marcada con `@Public()`, se permite el acceso
 *   sin más verificaciones.
 * - Si no se especificó ningún rol con `@Roles(...)`, se permite el acceso — la guardia
 *   es de habilitación explícita por ruta, no restrictiva por defecto.
 * - En caso contrario, se compara la lista de roles requeridos contra los roles del usuario,
 *   leídos de `request.user.roles` o `request.user.role` (string, enum o array), sin
 *   distinguir mayúsculas de minúsculas.
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

    const requiredRoles: RoleLike[] = this.reflector.getAllAndOverride<RoleLike[]>(ROLES_KEY, [
      _context.getHandler(),
      _context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request: IRolesRequest = _context.switchToHttp().getRequest<IRolesRequest>();

    if (!hasAnyRequiredRole(request.user, requiredRoles)) {
      throw new HttpException('Insufficient role', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
