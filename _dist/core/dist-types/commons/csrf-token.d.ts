import { CookieOptions, Request, Response, NextFunction } from 'express';
/**
 * Opciones para la configuración de la cookie CSRF.
 */
export interface CsrfCookieOptions extends CookieOptions {
    /** Clave para la cookie CSRF. Usada como nombre de la cookie en la respuesta y la solicitud. */
    key?: string;
    /** Nombre de la cookie CSRF. */
    cookieName?: string;
    /** Frase secreta para firmar la cookie CSRF. */
    secret?: string;
}
/**
 * Interfaz extendida para la solicitud con configuración de cookie CSRF.
 */
export interface ICsrfRequest extends Request {
    /** Configuración de la cookie CSRF. */
    cookieConfig?: CsrfCookieOptions;
    /** Función para obtener el token CSRF. */
    csrfToken?: () => string;
}
/**
 * Middleware para generar y manejar tokens CSRF.
 * Crea o verifica el token CSRF en las solicitudes y establece la cookie CSRF en las respuestas.
 *
 * @param options Opciones de configuración de la cookie CSRF.
 * @returns Función middleware para Express.
 * @example
 * app.use(csrfToken({ secret: 'mySecret', cookieName: 'myCsrfCookie' }));
 */
export declare const csrfToken: (options?: CsrfCookieOptions) => ((req: ICsrfRequest, res: Response, next: NextFunction) => void);
/**
 * Extrae la información del dispositivo y la dirección IP a partir de un token.
 *
 * @param {string | false} secret - El secret del cual extraer la información.
 * @returns {{ deviceData: string | null; ip: string | null }} Un objeto que contiene la información del dispositivo y la dirección IP.
 */
export declare const extractDeviceData: (secret: string | false) => {
    deviceData: string;
    ip: string;
};
/**
 * Obtiene la dirección IP del solicitante a partir de la solicitud.
 *
 * @param {Request} req - La solicitud de la que obtener la dirección IP.
 * @returns {string | undefined} La dirección IP del solicitante, o undefined si no se puede determinar.
 */
export declare const getIpAddress: (req: Request) => string | undefined;
/**
 * Obtiene el User Agent del solicitante a partir de la solicitud.
 *
 * @param {Request} req - La solicitud de la que obtener el User Agent.
 * @returns {string} El User Agent del solicitante, o undefined si no se puede determinar.
 */
export declare const getUserAgent: (req: Request) => string;
/**
 * Obtiene el secreto de la solicitud.
 * Busca el secreto en las cookies o cookies firmadas de la solicitud, dependiendo de la configuración de la cookie CSRF.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @param {string} name - Nombre de la cookie que contiene el secreto.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 * @returns {string | false} El secreto si se encuentra, de lo contrario false.
 */
export declare const getSecretFromRequest: (req: ICsrfRequest, name: string, cookie: CsrfCookieOptions) => string | false;
/**
 * Obtiene el token CSRF de la solicitud.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @returns {string | false | undefined} El token CSRF si se encuentra, de lo contrario false o undefined.
 */
export declare const getCsrfFromRequest: (req: ICsrfRequest) => string | false | undefined;
/**
 * Verifica si un token CSRF es válido.
 * Compara el token proporcionado con el secreto para determinar su validez.
 *
 * @param {string} secret - Secreto para verificar el token.
 * @param {string} token - Token CSRF.
 * @returns {boolean} True si el token es válido, de lo contrario false.
 */
export declare const verify: (secret: string, token: string) => boolean;
