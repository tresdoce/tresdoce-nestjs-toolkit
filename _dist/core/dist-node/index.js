'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var cookie = require('cookie');
var cookieSignature = require('cookie-signature');
var Tokens = _interopDefault(require('csrf'));
var swagger = require('@nestjs/swagger');
var classTransformer = require('@nestjs/class-transformer');
var classValidator = require('@nestjs/class-validator');
var fs = _interopDefault(require('fs'));
var Joi = _interopDefault(require('joi'));

var EAppStage;
(function (EAppStage) {
  EAppStage["local"] = "local";
  EAppStage["test"] = "test";
  EAppStage["snd"] = "snd";
  EAppStage["dev"] = "dev";
  EAppStage["qa"] = "qa";
  EAppStage["homo"] = "homo";
  EAppStage["prod"] = "prod";
})(EAppStage || (EAppStage = {}));
var ESkipHealthChecks;
(function (ESkipHealthChecks) {
  ESkipHealthChecks["storage"] = "storage";
  ESkipHealthChecks["memory"] = "memory";
  ESkipHealthChecks["elasticsearch"] = "elasticsearch";
  ESkipHealthChecks["camunda"] = "camunda";
  ESkipHealthChecks["typeorm"] = "typeorm";
  ESkipHealthChecks["redis"] = "redis";
})(ESkipHealthChecks || (ESkipHealthChecks = {}));

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get EAppStage () { return EAppStage; },
    get ESkipHealthChecks () { return ESkipHealthChecks; }
});

const corePathsExcludes = () => {
  const apiContext = process.env.CONTEXT ? `/${process.env.CONTEXT}` : '';
  return [{
    path: `${apiContext}/health/liveness`,
    method: common.RequestMethod.GET
  }, {
    path: `${apiContext}/health/readiness`,
    method: common.RequestMethod.GET
  }, {
    path: `${apiContext}/info`,
    method: common.RequestMethod.GET
  }, {
    path: `${apiContext}/metrics`,
    method: common.RequestMethod.GET
  }];
};
const excludePaths = () => corePathsExcludes().map(item => item.path);
const corePathsExcludesGlobs = ['**/health/liveness', '**/health/readiness', '**/info', '**/metrics'];

function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}

/**
 * Proveedor de tokens CSRF.
 */
const tokenProvider = new Tokens({
  secretLength: 16,
  saltLength: 16
});
/** Clave predeterminada para la cookie CSRF. */
const DEFAULT_CSRF_COOKIE_KEY = '_csrf';
/** Nombre predeterminado para la cookie CSRF. */
const DEFAULT_CSRF_COOKIE_NAME = 'xsrf-token';
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
  cookieName: DEFAULT_CSRF_COOKIE_NAME
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
const csrfToken = options => {
  const cookieConfig = _objectSpread2(_objectSpread2({}, DEFAULT_COOKIE_CONFIG), options);
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
const createSecret = req => {
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
const extractDeviceData = secret => {
  if (!secret) return {
    deviceData: null,
    ip: null
  };
  const [userData] = secret.split('-');
  const [ip, deviceData] = Buffer.from(userData, 'base64').toString('ascii').split('-');
  return {
    deviceData,
    ip
  };
};
/**
 * Obtiene la dirección IP del solicitante a partir de la solicitud.
 *
 * @param {Request} req - La solicitud de la que obtener la dirección IP.
 * @returns {string | undefined} La dirección IP del solicitante, o undefined si no se puede determinar.
 */
const getIpAddress = req => {
  var _req$socket;
  /* istanbul ignore next */
  const forwardedIps = Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for'];
  if (forwardedIps) {
    const firstForwardedIp = forwardedIps.split(',')[0];
    if (firstForwardedIp) {
      return firstForwardedIp;
    }
  }
  /* istanbul ignore next */
  return req.ip || ((_req$socket = req.socket) === null || _req$socket === void 0 ? void 0 : _req$socket.remoteAddress) || undefined;
};
/**
 * Obtiene el User Agent del solicitante a partir de la solicitud.
 *
 * @param {Request} req - La solicitud de la que obtener el User Agent.
 * @returns {string} El User Agent del solicitante, o undefined si no se puede determinar.
 */
const getUserAgent = req => req.headers['user-agent'] || '';
/**
 * Obtiene el secreto de la solicitud.
 * Busca el secreto en las cookies o cookies firmadas de la solicitud, dependiendo de la configuración de la cookie CSRF.
 *
 * @param {ICsrfRequest} req - Solicitud Express.
 * @param {string} name - Nombre de la cookie que contiene el secreto.
 * @param {CsrfCookieOptions} cookie - Configuración de la cookie CSRF.
 * @returns {string | false} El secreto si se encuentra, de lo contrario false.
 */
const getSecretFromRequest = (req, name, cookie) => {
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
const getCsrfFromRequest = req => getSecretFromRequest(req, req.cookieConfig.cookieName, req.cookieConfig);
/**
 * Verifica si un token CSRF es válido.
 * Compara el token proporcionado con el secreto para determinar su validez.
 *
 * @param {string} secret - Secreto para verificar el token.
 * @param {string} token - Token CSRF.
 * @returns {boolean} True si el token es válido, de lo contrario false.
 */
const verify = (secret, token) => tokenProvider.verify(secret, token);
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
    value = `s:${cookieSignature.sign(value, cookie.secret)}`;
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
  const serializedCookie = cookie.serialize(name, value, options);
  let existingHeaders = res.getHeader('Set-Cookie') || [];
  let headerArray = [];
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
const getSecretBag = (req, cookie) => cookie !== null && cookie !== void 0 && cookie.signed ? req['signedCookies'] : req['cookies'];
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

const IS_PUBLIC_KEY = 'isPublic';
const Public = () => common.SetMetadata(IS_PUBLIC_KEY, true);

const ROLES_KEY = 'roles';
const Roles = (...roles) => common.SetMetadata(ROLES_KEY, roles);

const EXCLUDE_FILTER_KEY = 'excludeFilter';
const ExcludeFilter = () => common.SetMetadata(EXCLUDE_FILTER_KEY, true);

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const MAX_SIZE = 100;

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class PaginationParamsDto {
  constructor() {
    this.page = DEFAULT_PAGE;
    this.size = DEFAULT_SIZE;
  }
}
__decorate([classValidator.IsOptional(), classTransformer.Type(() => Number), classValidator.IsInt({
  message: 'The page parameter is invalid. It must be an integer'
}), classValidator.IsPositive({
  message: 'The page parameter is invalid. It must be a positive'
}), swagger.ApiProperty({
  name: 'page',
  description: 'The current page number',
  default: DEFAULT_PAGE,
  minimum: 1,
  example: 1,
  required: false,
  type: Number
}), __metadata("design:type", Number)], PaginationParamsDto.prototype, "page", void 0);
__decorate([classValidator.IsOptional(), classTransformer.Type(() => Number), classValidator.IsInt({
  message: 'The size parameter is invalid. It must be an integer'
}), classValidator.IsPositive({
  message: 'The size parameter is invalid. It must be a positive'
}), classValidator.Max(MAX_SIZE, {
  message: `The size parameter is invalid. It must be a positive integer and cannot be more than ${MAX_SIZE}`
}), swagger.ApiProperty({
  name: 'size',
  description: 'The number of items per page',
  default: DEFAULT_SIZE,
  maximum: MAX_SIZE,
  example: 10,
  required: false,
  type: Number
}), __metadata("design:type", Number)], PaginationParamsDto.prototype, "size", void 0);

const DEFAULT_SORT_DIRECTION = 'asc';
const sortPattern = /^(\w+)(?::(asc|desc))?$/;

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class SortCriteriaDto {
  constructor() {
    this.order = DEFAULT_SORT_DIRECTION;
  }
}
__decorate$1([classValidator.IsString(), swagger.ApiProperty({
  description: 'The field name to sort by.'
}), __metadata$1("design:type", String)], SortCriteriaDto.prototype, "field", void 0);
__decorate$1([classValidator.IsIn(['asc', 'desc']), swagger.ApiProperty({
  description: `The order of sorting, either 'asc' or 'desc'.`,
  enum: ['asc', 'desc'],
  default: DEFAULT_SORT_DIRECTION
}), __metadata$1("design:type", String)], SortCriteriaDto.prototype, "order", void 0);

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$2 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class SortingParamsDto {}
__decorate$2([classValidator.IsString(), swagger.ApiProperty({
  name: 'sort',
  description: 'Sorting criteria in the format "field:direction". Multiple criteria can be separated by commas.\nExample: id:desc',
  required: false
}), __metadata$2("design:type", String)], SortingParamsDto.prototype, "sort", void 0);

const formatRegex = /^([a-zA-Z0-9_]+):([a-zA-Z]+)(?::((?:[^,:]+(?:,[^,:]+)*)?))?$/i;
const ruleRegex = /^(eq|neq|gt|gte|lt|lte|like|nlike|in|nin|isnull|isnotnull)$/i;

(function (FilterRule) {
  FilterRule["EQUALS"] = "eq";
  FilterRule["NOT_EQUALS"] = "neq";
  FilterRule["GREATER_THAN"] = "gt";
  FilterRule["GREATER_THAN_OR_EQUALS"] = "gte";
  FilterRule["LESS_THAN"] = "lt";
  FilterRule["LESS_THAN_OR_EQUALS"] = "lte";
  FilterRule["LIKE"] = "like";
  FilterRule["NOT_LIKE"] = "nlike";
  FilterRule["IN"] = "in";
  FilterRule["NOT_IN"] = "nin";
  FilterRule["IS_NULL"] = "isnull";
  FilterRule["IS_NOT_NULL"] = "isnotnull";
})(exports.FilterRule || (exports.FilterRule = {}));
/**
 * Converts a filter value string to the appropriate type based on the filter rule.
 * @param rule - The filter rule.
 * @param value - The string value to convert.
 * @returns The value converted to the appropriate type, or undefined for IS_NULL and IS_NOT_NULL rules.
 */
const convertFilterValue = (rule, value) => {
  /* istanbul ignore next */
  switch (rule) {
    case exports.FilterRule.IN:
    case exports.FilterRule.NOT_IN:
      return value;
    case exports.FilterRule.IS_NULL:
    case exports.FilterRule.IS_NOT_NULL:
      /* istanbul ignore next */
      return;
    case exports.FilterRule.GREATER_THAN:
    case exports.FilterRule.GREATER_THAN_OR_EQUALS:
    case exports.FilterRule.LESS_THAN:
    case exports.FilterRule.LESS_THAN_OR_EQUALS:
      return Number(value);
    case exports.FilterRule.EQUALS:
    case exports.FilterRule.NOT_EQUALS:
      return isNaN(Number(value)) ? value : Number(value);
    default:
      return value;
  }
};
/**
 * Divide una cadena de parámetros de filtro en filtros individuales, teniendo en cuenta las reglas IN y NOT_IN.
 * Las reglas IN y NOT_IN pueden contener comas en sus valores, por lo que esta función asegura que dichas comas no se usen para dividir la cadena.
 *
 * @param {string} filterParam - La cadena de parámetros de filtro completa de la solicitud.
 * @returns {string[]} Un array de cadenas, cada una representando un filtro individual.
 */
const parseFilters = filterParam => {
  const filters = [];
  let buffer = '';
  let isInValue = false;
  for (const char of filterParam) {
    if (char === ':' && buffer.endsWith('in') || buffer.endsWith('nin')) {
      isInValue = true;
    } else if (char === ',' && !isInValue) {
      filters.push(buffer);
      buffer = '';
      continue;
    } else if (char === ',' && isInValue) {
      isInValue = false;
    }
    buffer += char;
  }
  if (buffer) {
    filters.push(buffer);
  }
  return filters;
};
/**
 * Decorator that extracts and validates filtering parameters from the request query.
 * It parses the 'filter' parameter which can be a comma-separated list of property:rule[:value] entries.
 * @param validProperties - Array of valid property names that can be used for filtering.
 * @param ctx - The execution context, providing access to the incoming request.
 * @returns An array of Filtering objects, each representing a filter criterion.
 * @throws BadRequestException if the filter parameter format is invalid or a property/rule is not in the list of valid options.
 *
 * @example
 * // Use within a controller to get filtering parameters.
 * @Get()
 * findAll(@FilteringParams(['age', 'name']) filters: Filtering<any>[]) {
 *   filters.forEach(filter => {
 *     console.log(filter.property); // property name
 *     console.log(filter.rule); // filter rule
 *     console.log(filter.values); // array of values
 *   });
 *   // Additional logic to handle data fetching based on filter parameters.
 * }
 *
 * @example
 * // Query with a single filter parameter
 * GET /items?filter=age:gt:30
 *
 * @example
 * // Query with multiple filter parameters
 * GET /items?filter=age:gt:30,name:like:John,status:in:active,inactive
 */
const FilteringParams = common.createParamDecorator((validProperties, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const filterParam = request.query.filters;
  if (!filterParam) return [];
  if (!Array.isArray(validProperties)) {
    throw new common.BadRequestException('Invalid filter configuration');
  }
  const filters = parseFilters(filterParam);
  return filters.map(filter => {
    const formatMatch = formatRegex.exec(filter);
    if (!formatMatch) {
      throw new common.BadRequestException(`Invalid filter format, expected 'property:rule[:value]: ${filter}`);
    }
    const [, property, rule, valueString] = formatMatch;
    if (!validProperties.includes(property)) {
      throw new common.BadRequestException(`Invalid filter property: ${property}`);
    }
    /* istanbul ignore next */
    if (!Object.values(exports.FilterRule).includes(rule) && !ruleRegex.exec(rule)) {
      /* istanbul ignore next */
      throw new common.BadRequestException(`Invalid filter rule: ${rule}`);
    }
    let values = [];
    if (valueString) {
      if (rule === exports.FilterRule.IN || rule === exports.FilterRule.NOT_IN) {
        values = valueString.split(',').map(value => convertFilterValue(rule, value));
      } else {
        values = [convertFilterValue(rule, valueString)];
      }
    }
    return {
      property,
      rule: rule,
      values: values.filter(v => v !== undefined)
    };
  });
});

var __decorate$3 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$3 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class FilteringCriteriaDto {}
__decorate$3([classValidator.IsString(), swagger.ApiProperty({
  example: 'name',
  description: 'The property to filter by.'
}), __metadata$3("design:type", String)], FilteringCriteriaDto.prototype, "property", void 0);
__decorate$3([classValidator.IsEnum(exports.FilterRule), swagger.ApiProperty({
  example: exports.FilterRule.GREATER_THAN,
  enum: exports.FilterRule,
  description: 'The filtering rule to apply.'
}), __metadata$3("design:type", String)], FilteringCriteriaDto.prototype, "rule", void 0);
__decorate$3([classValidator.IsArray(), classValidator.IsString({
  each: true
}), classValidator.IsOptional(), swagger.ApiProperty({
  example: ['morty'],
  description: 'The value(s) for the filtering criterion.',
  type: [String]
}), __metadata$3("design:type", Array)], FilteringCriteriaDto.prototype, "values", void 0);

var __decorate$4 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$4 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class FilteringParamsDto {}
__decorate$4([classValidator.IsString(), swagger.ApiProperty({
  name: 'filters',
  description: 'Filter criteria in the format property:rule:values. Multiple criteria can be separated by commas. Example: age:gt:30,status:in:active,inactive',
  required: false
}), __metadata$4("design:type", String)], FilteringParamsDto.prototype, "filters", void 0);

var __decorate$5 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$5 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
class PaginationMetaData {}
__decorate$5([swagger.ApiProperty({
  required: true,
  description: 'The current page number in the pagination.',
  example: 1
}), __metadata$5("design:type", Number)], PaginationMetaData.prototype, "page", void 0);
__decorate$5([swagger.ApiProperty({
  required: true,
  description: 'The number of items per page in the pagination.',
  example: 10
}), __metadata$5("design:type", Number)], PaginationMetaData.prototype, "size", void 0);
__decorate$5([swagger.ApiProperty({
  required: true,
  description: 'The total number of items available.',
  example: 30
}), __metadata$5("design:type", Number)], PaginationMetaData.prototype, "total", void 0);
__decorate$5([swagger.ApiProperty({
  required: false,
  description: 'The total number of pages in the pagination.',
  example: 3
}), __metadata$5("design:type", Number)], PaginationMetaData.prototype, "totalPages", void 0);
__decorate$5([swagger.ApiProperty({
  required: false,
  description: 'Indicates whether there is a next page available.',
  example: true
}), __metadata$5("design:type", Boolean)], PaginationMetaData.prototype, "hasNext", void 0);
__decorate$5([swagger.ApiProperty({
  required: false,
  description: 'Indicates whether there is a previous page available.',
  example: false
}), __metadata$5("design:type", Boolean)], PaginationMetaData.prototype, "hasPrevious", void 0);
class PaginationResponse {}
__decorate$5([swagger.ApiProperty({
  description: 'Data containing the response.',
  required: true
}), __metadata$5("design:type", Array)], PaginationResponse.prototype, "data", void 0);
__decorate$5([swagger.ApiProperty({
  description: 'Metadata for the response, including pagination information.',
  required: true
}), __metadata$5("design:type", PaginationMetaData)], PaginationResponse.prototype, "meta", void 0);

/**
 * Custom decorator that extracts and validates pagination parameters from the request query.
 * It ensures the parameters 'page' and 'size' are within specified limits and are valid integers.
 * The 'page' parameter defaults to 1 if not provided or if invalid.
 * The 'size' parameter defaults to 10 if not provided, if invalid, or if it exceeds the maximum allowed value (MAX_SIZE).
 *
 * @param {unknown} data - The data passed to the decorator. Not used in this case.
 * @param {ExecutionContext} ctx - The execution context, providing access to the incoming request.
 * @returns {PaginationParams} An object containing the 'page' and 'size' after validation.
 *
 * @throws {BadRequestException} If 'page' or 'size' are provided but are not positive integers,
 *                               or if 'size' is provided and exceeds the maximum allowed value (MAX_SIZE).
 *
 * @example
 * // Use within a controller to get pagination parameters.
 * @Get()
 * findAll(@Pagination() pagination: PaginationParams) {
 *   console.log(pagination.page); // Current page number, defaults to 1 if not provided
 *   console.log(pagination.size); // Number of items per page, defaults to 10 if not provided or invalid
 *   // Additional logic to handle the data fetching based on pagination parameters
 * }
 *
 * @example
 * // Query with valid page and size parameters
 * GET /items?page=2&size=20
 * // Query with 'size' exceeding the MAX_SIZE limit
 * GET /items?page=1&size=150  // Will throw BadRequestException
 * // Query without page and size parameters
 * GET /items  // 'page' defaults to 1 and 'size' defaults to 10
 * // Query with invalid page
 * GET /items?page=invalid&size=10  // 'page' defaults to 1
 * // Query with invalid size
 * GET /items?page=2&size=invalid  // 'size' defaults to 10
 */
const Pagination = common.createParamDecorator((data, ctx) => {
  const context = ctx.switchToHttp();
  const request = context.getRequest();
  let page = Number(request.query.page);
  let size = Number(request.query.size);
  if (request.query.page !== undefined && (!Number.isInteger(page) || page < 1)) {
    throw new common.BadRequestException('The page parameter is invalid. It must be a positive integer.');
  }
  if (request.query.size !== undefined && (!Number.isInteger(size) || size < 1 || size > MAX_SIZE)) {
    throw new common.BadRequestException(`The size parameter is invalid. It must be a positive integer and cannot be more than ${MAX_SIZE}.`);
  }
  page = page >= 1 ? page : DEFAULT_PAGE;
  size = size >= 1 && size <= MAX_SIZE ? size : DEFAULT_SIZE;
  return {
    page,
    size
  };
});

/**
 * Custom decorator that extracts and validates sorting parameters from the request query.
 * It parses the 'sort' parameter, which can be a comma-separated list of fields with optional
 * sorting direction ('asc' or 'desc') specified using a colon. The default sorting direction is
 * defined by DEFAULT_SORT_DIRECTION if not provided.
 *
 * @param {string[]} sortingFieldNames - A list of valid field names that can be used for sorting.
 * @param {ExecutionContext} ctx - The execution context, providing access to the incoming request.
 * @returns {SortCriteria[]} An array of sorting criteria.
 *
 * @throws {BadRequestException} If the 'sort' parameter format is invalid, if a field is not in the list of sortingFieldNames,
 *                               or if the configuration for sorting parameters is invalid.
 *
 * @example
 * // Use within a controller to get sorting parameters.
 * @Get()
 * findAll(@Sorting(['user_id', 'first_name']) sorting: SortCriteria[]) {
 *   console.log(sorting); // Array of sorting fields and directions
 *   // Additional logic to handle the data fetching based on sorting parameters
 * }
 *
 * @example
 * // Query with sorting parameters
 * GET /items?sort=user_id:asc,first_name:desc
 * // Query with default sorting direction
 * GET /items?sort=user_id
 * // Query with an invalid field (not included in sortingFieldNames)
 * GET /items?sort=invalid_field:asc // Will throw BadRequestException
 */
const Sorting = common.createParamDecorator((sortingFieldNames, ctx) => {
  const request = ctx.switchToHttp().getRequest();
  const sortParam = request.query.sort;
  if (!sortParam) {
    return [];
  }
  if (!Array.isArray(sortingFieldNames)) {
    throw new common.BadRequestException('Invalid configuration for sorting parameters.');
  }
  return sortParam.split(',').map(sortField => {
    if (!sortPattern.exec(sortField)) {
      throw new common.BadRequestException(`The sorting parameter "${sortField}" is invalid. It should have the format 'field_name[:direction]', where direction is 'asc' or 'desc' and is optional.`);
    }
    const [field, order = DEFAULT_SORT_DIRECTION] = sortField.split(':');
    if (!sortingFieldNames.includes(field)) {
      throw new common.BadRequestException(`The sorting property "${field}" is invalid. It should be one of the following: ${sortingFieldNames.join(', ')}.`);
    }
    return {
      field,
      order: order
    };
  });
});

var __decorate$6 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Guardia para proteger las rutas contra ataques CSRF (Cross-Site Request Forgery).
 * Verifica la presencia y validez del token CSRF en las solicitudes entrantes.
 * Puede ser personalizado con opciones para cambiar el mensaje y el código de estado de la excepción lanzada.
 */
exports.CsrfGuard = class CsrfGuard {
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
    const {
      deviceData,
      ip
    } = extractDeviceData(secret);
    if (!secret || !token) {
      throw new common.HttpException('CSRF token not found', common.HttpStatus.FORBIDDEN);
    }
    if (deviceData !== getUserAgent(request)) {
      throw new common.HttpException('Invalid device', common.HttpStatus.FORBIDDEN);
    }
    if (ip !== getIpAddress(request)) {
      throw new common.HttpException('Invalid IP device', common.HttpStatus.FORBIDDEN);
    }
    if (!verify(secret, token)) {
      throw new common.HttpException('Invalid CSRF Token', common.HttpStatus.FORBIDDEN);
    }
    request.csrfToken();
    return true;
  }
};
exports.CsrfGuard = __decorate$6([common.Injectable()], exports.CsrfGuard);

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
const Csrf = () => process.env.NODE_ENV === 'test' ? common.applyDecorators(common.SetMetadata('skipCsrfGuard', true)) : common.applyDecorators(common.UseGuards(new exports.CsrfGuard()));

const setHttpsOptions = (certPath, publicKeyPath) => {
  if (fs.existsSync(certPath) && fs.existsSync(publicKeyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(publicKeyPath)
    };
  }
  return {
    cert: '',
    key: ''
  };
};

const validateSchema = (validationSchema, input) => {
  const result = Joi.object(validationSchema).validate(input);
  if (result.error) {
    throw Error(result.error.message);
  }
  return result.value;
};
const validateAdditionType = (_appStage, _helpers) => {
  if (!Object.values(EAppStage).includes(_appStage)) {
    return _helpers.error('APP_STAGE.invalid');
  }
  return _appStage;
};
const validateSkipHealthChecksType = (_skipHealthChecks, _helpers) => {
  const skipHealthChecks = _skipHealthChecks.split(',').map(_item => _item.trim().toLowerCase());
  for (const skipItem of skipHealthChecks) {
    if (!Object.values(ESkipHealthChecks).includes(skipItem)) {
      return _helpers.error('SKIP_HEALTH_CHECKS.invalid');
    }
  }
  return _skipHealthChecks;
};
const baseValidationSchema = {
  NODE_ENV: Joi.string().required(),
  APP_STAGE: Joi.any().required().custom(validateAdditionType, 'APP_STAGE validation'),
  PORT: Joi.number().required(),
  API_PREFIX: Joi.string().required(),
  CONTEXT: Joi.string().required(),
  ORIGINS: Joi.string().required(),
  EXPOSED_HEADERS: Joi.string().optional(),
  ALLOWED_HEADERS: Joi.string().required(),
  ALLOWED_METHODS: Joi.string().required(),
  PROPAGATE_HEADERS: Joi.string().optional().default([]),
  CORS_ENABLED: Joi.boolean().required(),
  CORS_CREDENTIALS: Joi.boolean().required(),
  SWAGGER_PATH: Joi.string().required(),
  SWAGGER_ENABLED: Joi.boolean().required(),
  SKIP_HEALTH_CHECKS: Joi.string().optional().custom(validateSkipHealthChecksType, 'SKIP_HEALTH_CHECKS validation'),
  HEALTH_CHECK_STORAGE_PATH: Joi.string().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD: Joi.number().optional(),
  HEALTH_CHECK_STORAGE_THRESHOLD_PERCENT: Joi.number().optional(),
  HEALTH_CHECK_MEMORY_HEAP: Joi.number().optional(),
  HEALTH_CHECK_MEMORY_RSS: Joi.number().optional()
};
const validationSchemaCsrf = {
  CSRF_SECRET: Joi.string().when('APP_STAGE', {
    is: 'prod',
    then: Joi.string().required().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{32}$/).messages({
      'string.empty': '"CSRF_SECRET" cannot be empty. Request a valid "CSRF_SECRET" from the IT security team.',
      'string.pattern.base': '"CSRF_SECRET" is invalid.',
      'any.required': '"CSRF_SECRET" is required. Request a valid "CSRF_SECRET" from the IT security team.'
    }),
    otherwise: Joi.string().optional()
  })
};
const baseValidationSchemaApp = _objectSpread2(_objectSpread2({}, baseValidationSchema), {}, {
  TRACING_ENDPOINT: Joi.string().optional(),
  TRACING_AUTH_TOKEN: Joi.string().optional(),
  TRACING_IGNORE_PATHS: Joi.string().optional()
});
const validateSchemaForApp = _validationSchema => {
  return Joi.object(_objectSpread2(_objectSpread2({}, baseValidationSchemaApp), _validationSchema));
};

/**
 * Parses a comma-separated string of health checks to skip and returns an array of skipped health checks.
 *
 * @param {string} _value - The comma-separated string of health checks to skip.
 * @returns {TSkipHealthChecks[]} An array of health checks to skip. Possible values include 'storage', 'memory', and 'observability'.
 *
 * @example
 * // Usage example:
 * const skipChecksString = 'storage,memory';
 * const skippedChecks = getSkipHealthChecks(skipChecksString);
 * console.log(skippedChecks);
 *
 * // Output:
 * // ['storage', 'memory']
 *
 * @returns {TSkipHealthChecks[]} An array of health checks to skip.
 */
const getSkipHealthChecks = _value => {
  return _value ? _value.split(',').map(_item => _item.toLowerCase().trim()) : [];
};
/**
 * Calculates pagination metadata based on the provided parameters.
 *
 * @param {PaginateDataParams} params - The pagination parameters.
 * @returns {IPaginateData} The paginated data with metadata.
 *
 * @example
 * // Usage example:
 * const params = {
 *   total: 100,
 *   page: 2,
 *   size: 10,
 * };
 *
 * const paginatedData = calculatePagination(params);
 * console.log(paginatedData);
 *
 * // Output:
 * // {
 * //   page: 2,
 * //   size: 10,
 * //   total: 100,
 * //   totalPages: 10,
 * //   hasNext: true,
 * //   hasPrevious: true
 * // }
 *
 * @returns {IPaginateData} The paginated data with metadata.
 */
const calculatePagination = ({
  total,
  page,
  size
}) => ({
  page,
  size,
  total,
  totalPages: Math.ceil(total / size),
  hasNext: page < Math.ceil(total / size),
  hasPrevious: page > 1
});

exports.Csrf = Csrf;
exports.EXCLUDE_FILTER_KEY = EXCLUDE_FILTER_KEY;
exports.ExcludeFilter = ExcludeFilter;
exports.FilteringCriteriaDto = FilteringCriteriaDto;
exports.FilteringParams = FilteringParams;
exports.FilteringParamsDto = FilteringParamsDto;
exports.IS_PUBLIC_KEY = IS_PUBLIC_KEY;
exports.Pagination = Pagination;
exports.PaginationMetaData = PaginationMetaData;
exports.PaginationParamsDto = PaginationParamsDto;
exports.PaginationResponse = PaginationResponse;
exports.Public = Public;
exports.ROLES_KEY = ROLES_KEY;
exports.Roles = Roles;
exports.SortCriteriaDto = SortCriteriaDto;
exports.Sorting = Sorting;
exports.SortingParamsDto = SortingParamsDto;
exports.Typings = index;
exports.baseValidationSchema = baseValidationSchema;
exports.baseValidationSchemaApp = baseValidationSchemaApp;
exports.calculatePagination = calculatePagination;
exports.convertFilterValue = convertFilterValue;
exports.corePathsExcludes = corePathsExcludes;
exports.corePathsExcludesGlobs = corePathsExcludesGlobs;
exports.csrfToken = csrfToken;
exports.excludePaths = excludePaths;
exports.getCsrfFromRequest = getCsrfFromRequest;
exports.getSecretFromRequest = getSecretFromRequest;
exports.getSkipHealthChecks = getSkipHealthChecks;
exports.parseFilters = parseFilters;
exports.setHttpsOptions = setHttpsOptions;
exports.validateSchema = validateSchema;
exports.validateSchemaForApp = validateSchemaForApp;
exports.validationSchemaCsrf = validationSchemaCsrf;
exports.verify = verify;
//# sourceMappingURL=index.js.map
