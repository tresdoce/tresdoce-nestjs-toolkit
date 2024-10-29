import { serialize } from 'cookie';
import { sign } from 'cookie-signature';
import Tokens from 'csrf';
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
 * Proveedor de tokens CSRF.
 */
const tokenProvider: Tokens = new Tokens({
  secretLength: 16,
  saltLength: 16,
});

/** Clave predeterminada para la cookie CSRF. */
const DEFAULT_CSRF_COOKIE_KEY: string = '_csrf';
/** Nombre predeterminado para la cookie CSRF. */
const DEFAULT_CSRF_COOKIE_NAME: string = 'xsrf-token';
/** Nombres predeterminados de token CSRF. */
const CSRF_TOKEN_NAMES: string[] = [
  DEFAULT_CSRF_COOKIE_NAME,
  'csrf-token',
  'x-csrf-token',
  'x-xsrf-token',
];
/** Configuración predeterminada para la cookie CSRF. */
const DEFAULT_COOKIE_CONFIG: CsrfCookieOptions = {
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
export const csrfToken = (
  options?: CsrfCookieOptions,
): ((req: ICsrfRequest, res: Response, next: NextFunction) => void) => {
  const cookieConfig: CsrfCookieOptions = {
    ...DEFAULT_COOKIE_CONFIG,
    ...options,
  };

  return (req: ICsrfRequest, res: Response, next: NextFunction): void => {
    let csrfTokenValue: string | undefined;
    let secret: string | false = getSecretFromRequest(req, cookieConfig.key, cookieConfig);

    if (!secret) {
      secret = createSecret(req);
      setSecret(res, cookieConfig.key, secret, cookieConfig);
    }

    req.cookieConfig = omit(cookieConfig, ['secret']);
    req.csrfToken = (): string => {
      if (!csrfTokenValue) {
        csrfTokenValue = tokenProvider.create(secret as string);
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
const createSecret = (req: Request): string => {
  const secret: string = tokenProvider.secretSync();
  const reqUserData: string = Buffer.from(`${getIpAddress(req)}-${getUserAgent(req)}`).toString(
    'base64',
  );
  return `${reqUserData}-${secret}`;
};

/**
 * Extrae la información del dispositivo y la dirección IP a partir de un token.
 *
 * @param {string | false} secret - El secret del cual extraer la información.
 * @returns {{ deviceData: string | null; ip: string | null }} Un objeto que contiene la información del dispositivo y la dirección IP.
 */
export const extractDeviceData = (secret: string | false): { deviceData: string; ip: string } => {
  if (!secret) return { deviceData: null, ip: null };
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
export const getIpAddress = (req: Request): string | undefined => {
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
export const getUserAgent = (req: Request): string => req.headers['user-agent'] || '';

/**
 * Obtiene el secreto de la solicitud.
 * Busca el secreto en las cookies o cookies firmadas de la solicitud, dependiendo de la configuración de la cookie CSRF.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @param {string} name - Nombre de la cookie que contiene el secreto.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 * @returns {string | false} El secreto si se encuentra, de lo contrario false.
 */
export const getSecretFromRequest = (
  req: ICsrfRequest,
  name: string,
  cookie: CsrfCookieOptions,
): string | false => {
  const bag: { [key: string]: any } | undefined = getSecretBag(req, cookie);
  const key: string = name;
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
export const getCsrfFromRequest = (req: ICsrfRequest): string | false | undefined =>
  getSecretFromRequest(req, req.cookieConfig.cookieName, req.cookieConfig);

/**
 * Verifica si un token CSRF es válido.
 * Compara el token proporcionado con el secreto para determinar su validez.
 *
 * @param {string} secret - Secreto para verificar el token.
 * @param {string} token - Token CSRF.
 * @returns {boolean} True si el token es válido, de lo contrario false.
 */
export const verify = (secret: string, token: string): boolean =>
  tokenProvider.verify(secret, token);

/**
 * Establece un secreto en la cookie.
 *
 * @param {Response} res - Respuesta Express.
 * @param {string} name - Nombre de la cookie.
 * @param {string} value - Valor del secreto.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 */
const setSecret = (res: Response, name: string, value: string, cookie: CsrfCookieOptions): void => {
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
const setCookie = (
  res: Response,
  name: string,
  value: string,
  options: CsrfCookieOptions,
): void => {
  const serializedCookie: string = serialize(name, value, options);
  let existingHeaders: string | number | string[] = res.getHeader('Set-Cookie') || [];

  let headerArray: string[] = [];
  if (Array.isArray(existingHeaders)) {
    headerArray = existingHeaders;
  } else if (typeof existingHeaders === 'string') {
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
const getSecretBag = (req: ICsrfRequest, cookie: CsrfCookieOptions): any =>
  cookie?.signed ? req['signedCookies'] : req['cookies'];

/**
 * Omite las claves especificadas de un objeto.
 *
 * @param obj - Objeto del cual se omiten las claves.
 * @param keys - Claves a omitir.
 * @returns Objeto resultante.
 */
const omit = (obj: Record<string, any>, keys: string[]): Record<string, any> => {
  return Object.keys(obj).reduce(
    (acc: Record<string, any>, key: string) => {
      if (!keys.includes(key)) {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as Record<string, any>,
  );
};
