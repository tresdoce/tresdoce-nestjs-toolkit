var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { extractDeviceData, getCsrfFromRequest, getSecretFromRequest, verify, getIpAddress, getUserAgent, } from '../commons/csrf-token';
/**
 * Guardia para proteger las rutas contra ataques CSRF (Cross-Site Request Forgery).
 * Verifica la presencia y validez del token CSRF en las solicitudes entrantes.
 * Puede ser personalizado con opciones para cambiar el mensaje y el código de estado de la excepción lanzada.
 */
let CsrfGuard = class CsrfGuard {
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
    canActivate(_context) {
        const ctx = _context.switchToHttp();
        const request = ctx.getRequest();
        const secret = getSecretFromRequest(request, request.cookieConfig.key, request.cookieConfig);
        const token = getCsrfFromRequest(request);
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
};
CsrfGuard = __decorate([
    Injectable()
], CsrfGuard);
export { CsrfGuard };
