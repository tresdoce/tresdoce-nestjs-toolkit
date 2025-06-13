import { serialize } from 'cookie';
import { sign } from 'cookie-signature';
import Tokens from 'csrf';
/**
 * Proveedor de tokens CSRF.
 */
const tokenProvider = new Tokens({
    secretLength: 16,
    saltLength: 16,
});
/** Clave predeterminada para la cookie CSRF. */
const DEFAULT_CSRF_COOKIE_KEY = '_csrf';
/** Nombre predeterminado para la cookie CSRF. */
const DEFAULT_CSRF_COOKIE_NAME = 'xsrf-token';
/** Nombres predeterminados de token CSRF. */
const CSRF_TOKEN_NAMES = [
    DEFAULT_CSRF_COOKIE_NAME,
    'csrf-token',
    'x-csrf-token',
    'x-xsrf-token',
];
/** Configuración predeterminada para la cookie CSRF. */
const DEFAULT_COOKIE_CONFIG = {
    sameSite: 'strict',
    httpOnly: true,
    signed: true,
    key: DEFAULT_CSRF_COOKIE_KEY,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 300,
    secret: '',
    cookieName: DEFAULT_CSRF_COOKIE_NAME,
};
/**
 * Middleware para generar y manejar tokens CSRF.
 * Crea o verifica el token CSRF en las solicitudes y establece la cookie CSRF en las respuestas.
 *
 * @param options Opciones de configuración de la cookie CSRF.
 * @returns Función middleware para Express.
 * @example
 * app.use(csrfToken({ secret: 'mySecret', cookieName: 'myCsrfCookie' }));
 */
export const csrfToken = (options) => {
    const cookieConfig = {
        ...DEFAULT_COOKIE_CONFIG,
        ...options,
    };
    return (req, res, next) => {
        let csrfTokenValue;
        let secret = getSecretFromRequest(req, cookieConfig.key, cookieConfig);
        if (!secret) {
            secret = createSecret(req);
            setSecret(res, cookieConfig.key, secret, cookieConfig);
        }
        req.cookieConfig = omit(cookieConfig, ['secret']);
        req.csrfToken = () => {
            if (!csrfTokenValue) {
                csrfTokenValue = tokenProvider.create(secret);
                setSecret(res, cookieConfig.cookieName, csrfTokenValue, cookieConfig);
                res.locals.csrfToken = csrfTokenValue;
            }
            return csrfTokenValue;
        };
        next();
    };
};
/**
 * Crea un secreto único para la sesión del usuario basado en su dirección IP y agente de usuario.
 * El secreto se utiliza para generar y verificar tokens CSRF.
 *
 * @param {Request} req - La solicitud HTTP entrante.
 * @returns {string} Un secreto codificado en base64 que incluye la dirección IP del usuario y el User Agent, seguido del secreto generado por el proveedor de tokens CSRF.
 */
const createSecret = (req) => {
    const secret = tokenProvider.secretSync();
    const reqUserData = Buffer.from(`${getIpAddress(req)}-${getUserAgent(req)}`).toString('base64');
    return `${reqUserData}-${secret}`;
};
/**
 * Extrae la información del dispositivo y la dirección IP a partir de un token.
 *
 * @param {string | false} secret - El secret del cual extraer la información.
 * @returns {{ deviceData: string | null; ip: string | null }} Un objeto que contiene la información del dispositivo y la dirección IP.
 */
export const extractDeviceData = (secret) => {
    if (!secret)
        return { deviceData: null, ip: null };
    const [userData] = secret.split('-');
    const [ip, deviceData] = Buffer.from(userData, 'base64').toString('ascii').split('-');
    return { deviceData, ip };
};
/**
 * Obtiene la dirección IP del solicitante a partir de la solicitud.
 *
 * @param {Request} req - La solicitud de la que obtener la dirección IP.
 * @returns {string | undefined} La dirección IP del solicitante, o undefined si no se puede determinar.
 */
export const getIpAddress = (req) => {
    /* istanbul ignore next */
    const forwardedIps = Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for'];
    if (forwardedIps) {
        const firstForwardedIp = forwardedIps.split(',')[0];
        if (firstForwardedIp) {
            return firstForwardedIp;
        }
    }
    /* istanbul ignore next */
    return req.ip || req.socket?.remoteAddress || undefined;
};
/**
 * Obtiene el User Agent del solicitante a partir de la solicitud.
 *
 * @param {Request} req - La solicitud de la que obtener el User Agent.
 * @returns {string} El User Agent del solicitante, o undefined si no se puede determinar.
 */
export const getUserAgent = (req) => req.headers['user-agent'] || '';
/**
 * Obtiene el secreto de la solicitud.
 * Busca el secreto en las cookies o cookies firmadas de la solicitud, dependiendo de la configuración de la cookie CSRF.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @param {string} name - Nombre de la cookie que contiene el secreto.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 * @returns {string | false} El secreto si se encuentra, de lo contrario false.
 */
export const getSecretFromRequest = (req, name, cookie) => {
    const bag = getSecretBag(req, cookie);
    const key = name;
    if (!bag || bag[key] === undefined) {
        return false;
    }
    return bag[key];
};
/**
 * Obtiene el token CSRF de la solicitud.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @returns {string | false | undefined} El token CSRF si se encuentra, de lo contrario false o undefined.
 */
export const getCsrfFromRequest = (req) => getSecretFromRequest(req, req.cookieConfig.cookieName, req.cookieConfig);
/**
 * Verifica si un token CSRF es válido.
 * Compara el token proporcionado con el secreto para determinar su validez.
 *
 * @param {string} secret - Secreto para verificar el token.
 * @param {string} token - Token CSRF.
 * @returns {boolean} True si el token es válido, de lo contrario false.
 */
export const verify = (secret, token) => tokenProvider.verify(secret, token);
/**
 * Establece un secreto en la cookie.
 *
 * @param {Response} res - Respuesta Express.
 * @param {string} name - Nombre de la cookie.
 * @param {string} value - Valor del secreto.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 */
const setSecret = (res, name, value, cookie) => {
    if (cookie.signed && cookie.secret) {
        value = `s:${sign(value, cookie.secret)}`;
    }
    setCookie(res, name, value, cookie);
};
/**
 * Establece una cookie en la respuesta.
 *
 * @param {Response} res - Respuesta Express.
 * @param {string} name - Nombre de la cookie.
 * @param {string} value - Valor de la cookie.
 * @param {CsrfCookieOptions} options - Opciones de configuración de la cookie.
 */
const setCookie = (res, name, value, options) => {
    const serializedCookie = serialize(name, value, options);
    let existingHeaders = res.getHeader('Set-Cookie') || [];
    let headerArray = [];
    if (Array.isArray(existingHeaders)) {
        headerArray = existingHeaders;
    }
    else if (typeof existingHeaders === 'string') {
        headerArray = [existingHeaders];
    }
    res.setHeader('Set-Cookie', [...headerArray, serializedCookie]);
};
/**
 * Obtiene el objeto de cookies de la solicitud.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 * @returns {any} Objeto de cookies.
 */
const getSecretBag = (req, cookie) => cookie?.signed ? req['signedCookies'] : req['cookies'];
/**
 * Omite las claves especificadas de un objeto.
 *
 * @param obj - Objeto del cual se omiten las claves.
 * @param keys - Claves a omitir.
 * @returns Objeto resultante.
 */
const omit = (obj, keys) => {
    return Object.keys(obj).reduce((acc, key) => {
        if (!keys.includes(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
};
