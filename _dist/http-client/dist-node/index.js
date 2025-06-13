'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var randomStringGenerator_util = require('@nestjs/common/utils/random-string-generator.util');
var Axios = _interopDefault(require('axios'));
var axiosRetry = _interopDefault(require('axios-retry'));
var _ = _interopDefault(require('lodash'));
var https = _interopDefault(require('https'));

const AXIOS_INSTANCE_TOKEN = Symbol('AXIOS_INSTANCE_TOKEN');
const HTTP_MODULE_ID = Symbol('HTTP_MODULE_ID');
const HTTP_MODULE_OPTIONS = Symbol('HTTP_MODULE_OPTIONS');
const HTTP_MODULE_CONFIG = Symbol('HTTP_MODULE_CONFIG');
const HTTP_MODULE_PROPAGATE_HEADERS = Symbol('HTTP_MODULE_PROPAGATE_HEADERS');
const headers = {
  'Content-Type': 'application/json',
  Accept: `application/vnd.iman.v1+json, application/json, text/plain, */*`,
  //'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache'
};
const propagateDefaultHeaders = ['uber-trace-id', 'x-amzn-trace-id'];
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  requestCert: false
});
const defaultConfigInstanceAxios = {
  headers,
  httpsAgent
};
var RequestMethod;
(function (RequestMethod) {
  RequestMethod["GET"] = "GET";
  RequestMethod["POST"] = "POST";
  RequestMethod["PUT"] = "PUT";
  RequestMethod["DELETE"] = "DELETE";
  RequestMethod["PATCH"] = "PATCH";
  RequestMethod["ALL"] = "ALL";
  RequestMethod["OPTIONS"] = "OPTIONS";
  RequestMethod["HEAD"] = "HEAD";
})(RequestMethod || (RequestMethod = {}));

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
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
exports.HttpClientService = class HttpClientService {
  /* istanbul ignore next */
  constructor(_instance = Axios, httpPropagateHeaders = []) {
    this._instance = _instance;
    this.httpPropagateHeaders = httpPropagateHeaders;
    this.headers = defaultConfigInstanceAxios.headers;
    // Methods
    /**
     * Make and http request in base of default config, and configuration
     * @param url API url for request
     * @param config AxiosRequestConfig type user configuration
     */
    this.fetch = async (url, config) => {
      try {
        config = _.omit(config, ['url']);
        config.headers = _.merge({}, this.headers, config.headers);
        return await this.axiosRef.request(_objectSpread2({
          url: encodeURI(url)
        }, config));
      } catch (error) {
        throw error;
      }
    };
    /**
     * Make http request  based on axios using user´s config
     * @param config Contain request configuration (headers, data, url, method...) type AxiosRequestConfig
     */
    this.request = async config => {
      return this.fetch(config.url, config);
    };
    /**
     * Make get http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, httpAgent...) type AxiosRequestConfig
     */
    this.get = async (url, config) => {
      return this.fetch(url, _objectSpread2(_objectSpread2({}, config), {}, {
        method: RequestMethod.GET
      }));
    };
    /**
     * Make post http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
     */
    this.post = async (url, config) => {
      return this.fetch(url, _objectSpread2(_objectSpread2({}, config), {}, {
        method: RequestMethod.POST
      }));
    };
    /**
     * Make put http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
     */
    this.put = async (url, config) => {
      return this.fetch(url, _objectSpread2(_objectSpread2({}, config), {}, {
        method: RequestMethod.PUT
      }));
    };
    /**
     * Make patch patch request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, data...) type AxiosRequestConfig
     */
    this.patch = async (url, config) => {
      return this.fetch(url, _objectSpread2(_objectSpread2({}, config), {}, {
        method: RequestMethod.PATCH
      }));
    };
    /**
     * Make delete http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (headers, params...) type AxiosRequestConfig
     */
    this.delete = async (url, config) => {
      return this.fetch(url, _objectSpread2(_objectSpread2({}, config), {}, {
        method: RequestMethod.DELETE
      }));
    };
    /**
     * Make head http request based on axios
     * @param url API url for request
     * @param config Contain request configuration (params, httpAgent...) type AxiosRequestConfig
     */
    this.head = async (url, config) => {
      return this.fetch(url, _objectSpread2(_objectSpread2({}, config), {}, {
        method: RequestMethod.HEAD
      }));
    };
    this.propagateHeadersList = _.union(propagateDefaultHeaders, this.httpPropagateHeaders);
    this.axiosRef.interceptors.request.use(config => config);
    this.axiosRef.interceptors.response.use(response => response, error => Promise.reject(error));
  }
  get axiosRef() {
    return this._instance;
  }
  initAxios({
    headers,
    ip
  }) {
    const propagateHeaders = Object.keys(headers).filter(key => this.propagateHeadersList.includes(key)).reduce((obj, key) => _objectSpread2(_objectSpread2({}, obj), {}, {
      [key]: headers[key]
    }), {});
    this.ip = ip;
    this.headers = _.merge({}, defaultConfigInstanceAxios.headers, propagateHeaders);
  }
};
exports.HttpClientService = __decorate([common.Injectable(), __param(0, common.Inject(AXIOS_INSTANCE_TOKEN)), __param(1, common.Inject(HTTP_MODULE_PROPAGATE_HEADERS)), __metadata("design:paramtypes", [Function, Array])], exports.HttpClientService);

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpClientModule_1;
const createAxiosRetry = (config = {}) => {
  const axiosInstanceConfig = _.merge({}, defaultConfigInstanceAxios, config);
  const axiosInstance = Axios.create(axiosInstanceConfig);
  axiosRetry(axiosInstance, axiosInstanceConfig);
  return axiosInstance;
};
exports.HttpClientModule = HttpClientModule_1 = class HttpClientModule {
  static register(config$1) {
    return {
      module: HttpClientModule_1,
      imports: [config.ConfigModule],
      providers: [exports.HttpClientService, {
        provide: AXIOS_INSTANCE_TOKEN,
        useValue: createAxiosRetry(config$1)
      }, {
        provide: HTTP_MODULE_PROPAGATE_HEADERS,
        useFactory: async configService => configService.get('config.httpClient.propagateHeaders') || [],
        inject: [config.ConfigService]
      }, {
        provide: HTTP_MODULE_ID,
        useValue: randomStringGenerator_util.randomStringGenerator()
      }],
      exports: [exports.HttpClientService]
    };
  }
  static registerAsync(options) {
    return {
      module: HttpClientModule_1,
      imports: [config.ConfigModule, ...(options.imports || [])],
      providers: [exports.HttpClientService, ...this.createAsyncProviders(options), {
        provide: AXIOS_INSTANCE_TOKEN,
        useFactory: config => createAxiosRetry(config),
        inject: [HTTP_MODULE_OPTIONS]
      }, {
        provide: HTTP_MODULE_PROPAGATE_HEADERS,
        useFactory: async configService => configService.get('config.httpClient.propagateHeaders') || [],
        inject: [config.ConfigService]
      }, {
        provide: HTTP_MODULE_ID,
        useValue: randomStringGenerator_util.randomStringGenerator()
      }, ...(options.extraProviders || [])],
      exports: [exports.HttpClientService]
    };
  }
  static createAsyncProviders(options) {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    const providers = [this.createAsyncOptionsProvider(options)];
    if (options.useClass) providers.push({
      provide: options.useClass,
      useClass: options.useClass
    });
    return providers;
  }
  static createAsyncOptionsProvider(options) {
    if (options.useFactory) {
      return {
        provide: HTTP_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || []
      };
    }
    let inject;
    if (options.useExisting) inject = [options.useExisting];else if (options.useClass) inject = [options.useClass];
    return {
      provide: HTTP_MODULE_OPTIONS,
      useFactory: async optionsFactory => optionsFactory.createHttpOptions(),
      inject
    };
  }
};
exports.HttpClientModule = HttpClientModule_1 = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [exports.HttpClientService, {
    provide: HTTP_MODULE_CONFIG,
    useFactory: async configService => configService.get('config.httpClient') || {},
    inject: [config.ConfigService]
  }, {
    provide: HTTP_MODULE_PROPAGATE_HEADERS,
    useFactory: async httpClient => httpClient.propagateHeaders || [],
    inject: [HTTP_MODULE_CONFIG]
  }, {
    provide: AXIOS_INSTANCE_TOKEN,
    useFactory: async httpClient => createAxiosRetry(httpClient.httpOptions),
    inject: [HTTP_MODULE_CONFIG]
  }],
  exports: [exports.HttpClientService]
})], exports.HttpClientModule);

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata$1 = undefined && undefined.__metadata || function (k, v) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
exports.HttpClientInterceptor = class HttpClientInterceptor {
  constructor(httpService) {
    this.httpService = httpService;
  }
  intercept(_context, _next) {
    const ctx = _context.switchToHttp();
    const request = ctx.getRequest();
    this.httpService.initAxios(request);
    return _next.handle();
  }
};
exports.HttpClientInterceptor = __decorate$2([common.Injectable({
  scope: common.Scope.REQUEST
}), __metadata$1("design:paramtypes", [exports.HttpClientService])], exports.HttpClientInterceptor);
//# sourceMappingURL=index.js.map
