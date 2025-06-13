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
export declare const Csrf: () => <TFunction extends Function, Y>(target: TFunction | object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
