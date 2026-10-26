import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  type ICsrfRequest,
  extractDeviceData,
  getCsrfFromRequest,
  getSecretFromRequest,
  verify,
  getIpAddress,
  getUserAgent,
} from '../commons/csrf-token.js';

type HttpArgumentsHost = ReturnType<import('@nestjs/common').ExecutionContext['switchToHttp']>;

/**
 * Guardia para proteger las rutas contra ataques CSRF (Cross-Site Request Forgery).
 * Verifica la presencia y validez del token CSRF en las solicitudes entrantes.
 * Puede ser personalizado con opciones para cambiar el mensaje y el código de estado de la excepción lanzada.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
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
  canActivate(_context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const ctx: HttpArgumentsHost = _context.switchToHttp();
    const request: ICsrfRequest = ctx.getRequest<ICsrfRequest>();

    if (!request.cookieConfig) {
      throw new InternalServerErrorException(
        'CSRF middleware is not configured. Register csrfToken() with app.use() before using CsrfGuard.',
      );
    }

    const secret: string | false | undefined = getSecretFromRequest(
      request,
      request.cookieConfig.key,
      request.cookieConfig,
    );
    const token: string | false | undefined = getCsrfFromRequest(request);
    const { deviceData, ip } = extractDeviceData(secret);

    if (!secret || !token) {
      throw new HttpException('CSRF token not found', HttpStatus.FORBIDDEN);
    }

    if (deviceData !== getUserAgent(request)) {
      throw new HttpException('Invalid device', HttpStatus.FORBIDDEN);
    }

    if (ip !== getIpAddress(request)) {
      throw new HttpException('Invalid IP device', HttpStatus.FORBIDDEN);
    }

    if (!verify(secret, token)) {
      throw new HttpException('Invalid CSRF Token', HttpStatus.FORBIDDEN);
    }

    request.csrfToken();

    return true;
  }
}
