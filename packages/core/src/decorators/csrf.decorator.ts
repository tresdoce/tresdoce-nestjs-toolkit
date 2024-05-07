import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { CsrfGuard } from '../guards/index';

/**
 * Decorador para proteger las rutas contra ataques CSRF (Cross-Site Request Forgery).
 * Aplica el guardia CSRF a las rutas decoradas, protegiéndolas contra ataques CSRF.
 * @returns Decorador que aplica el guardia CSRF a los controladores o métodos de controladores de NestJS.
 * @example
 * ```typescript
 * @Controller('api')
 * export class AppController {
 *   @Get()
 *   @Csrf() // Protege esta ruta contra ataques CSRF
 *   getHello(): string {
 *     return 'Hello World!';
 *   }
 * }
 * ```
 */
/* istanbul ignore next */
export const Csrf = () =>
  process.env.NODE_ENV === 'test'
    ? applyDecorators(SetMetadata('skipCsrfGuard', true))
    : applyDecorators(UseGuards(new CsrfGuard()));
