import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
/**
 * Guardia para proteger las rutas contra ataques CSRF (Cross-Site Request Forgery).
 * Verifica la presencia y validez del token CSRF en las solicitudes entrantes.
 * Puede ser personalizado con opciones para cambiar el mensaje y el código de estado de la excepción lanzada.
 */
export declare class CsrfGuard implements CanActivate {
    /**
     * Determina si la ruta puede ser activada basándose en la validación CSRF.
     * Verifica la presencia del token CSRF y su validez comparándolo con el secreto almacenado.
     *
     * @param _context Contexto de ejecución de NestJS.
     * @returns True si la solicitud es válida, de lo contrario, se lanza una excepción HTTP.
     * @throws {HttpException} Cuando falla la validación CSRF.
     * @example
     * ```typescript
     * @UseGuards(CsrfGuard)
     * @Post('create')
     * createItem(@Body() body: CreateItemDto) {
     *   // Lógica de creación del ítem
     * }
     * ```
     */
    canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>;
}
