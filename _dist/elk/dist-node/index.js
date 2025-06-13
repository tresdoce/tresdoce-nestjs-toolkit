'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var utils = require('@tresdoce-nestjs-toolkit/utils');
var elasticsearch = require('@elastic/elasticsearch');
var _ = _interopDefault(require('lodash'));
var uuid = require('uuid');
var filters = require('@tresdoce-nestjs-toolkit/filters');
var core = require('@tresdoce-nestjs-toolkit/core');
var rxjs = require('rxjs');

const ELK_CLIENT = Symbol('ELK_CLIENT');
const ELK_MODULE_OPTIONS = Symbol('ELK_MODULE_OPTIONS');
const ELK_MODULE_CLIENT_OPTIONS = Symbol('ELK_MODULE_CLIENT_OPTIONS');
const ELK_MSG_SUCCESSFULLY_CONNECTED = 'Connected successfully!:';
const ELK_MSG_ERROR_CONNECTED = 'Could not establish a connection:';
const ELK_OMITS_IN_OPTIONS = ['indexDate', 'redact'];

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

const createElkClient = () => ({
  provide: ELK_CLIENT,
  useFactory: async options => {
    const client = new elasticsearch.Client(_objectSpread2(_objectSpread2({}, options), {}, {
      generateRequestId: () => uuid.v4()
    }));
    /* istanbul ignore next */
    client.info().then(_response => common.Logger.log(`${ELK_MSG_SUCCESSFULLY_CONNECTED} ${_response.name}`, 'ElkModule')).catch(_error => {
      common.Logger.error(`${ELK_MSG_ERROR_CONNECTED} ${_error.message}`, 'ElkModule');
    });
    return client;
  },
  inject: [ELK_MODULE_OPTIONS]
});

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
exports.ElkService = class ElkService {
  constructor(configService, formatService, redactService, options, elkClient) {
    this.configService = configService;
    this.formatService = formatService;
    this.redactService = redactService;
    this.options = options;
    this.elkClient = elkClient;
  }
  get clientRef() {
    /* istanbul ignore next */
    return this.elkClient ? this.elkClient : null;
  }
  /*
   * Generate index name with date or not
   */
  generateIndexDocument(_suffix) {
    /* istanbul ignore next */
    const {
      indexDate = true,
      name
    } = this.options;
    /* istanbul ignore next */
    const indexName = _suffix ? [`${name.toString()}`, _suffix].join('-') : `${name.toString()}`;
    const currentDate = this.formatService.formatDate({
      date: new Date(),
      formatDate: 'yyyy.LL.dd'
    });
    return indexDate ? `${indexName}-${currentDate}` : `${indexName}`;
  }
  /*
   * Create index document
   */
  async createIndexDocument(elkDocument, _suffix) {
    try {
      var _this$clientRef;
      await ((_this$clientRef = this.clientRef) === null || _this$clientRef === void 0 ? void 0 : _this$clientRef.index({
        index: this.generateIndexDocument(_suffix),
        id: `${uuid.v4()}`,
        document: elkDocument
      }));
    } catch (_error) {
      /* istanbul ignore next */
      common.Logger.error(`Create document: ${_error.message}`, 'ElkModule');
    }
  }
  /*
   * Serialize response interceptor
   */
  async serializeResponseInterceptor(_timeRequest, _context, _response, _isException) {
    const application = `${this.configService.get('config.project.name')}`;
    const applicationVersion = `v${this.configService.get('config.project.version')}`;
    const appStage = `${this.configService.get('config.server.appStage')}`;
    const requestDuration = this.formatService.calculateTimestampDiff({
      startTime: _timeRequest,
      endTime: Date.now()
    });
    const controller = _context.getClass().name;
    const handler = _context.getHandler().name;
    const type = _context.getType();
    const ctx = _context.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();
    const cookies = req.cookies;
    const query = _.isEmpty(req.query) ? null : req.query;
    const params = _.isEmpty(req.params) ? null : req.params;
    const body = _.isEmpty(req.body) ? null : req.body;
    const headers = {
      request: req.headers,
      response: !_isException ? res.getHeaders() : {}
    };
    const path = `${req.path}`;
    const url = `${req.url}`;
    const method = `${req.method}`;
    let statusCode = res.statusCode;
    let response = _response;
    if (_.isUndefined(core.excludePaths().find(path => _.startsWith(req.path, path)))) {
      if (_isException) {
        const responseException = this.responseException(req, _response);
        response = responseException;
        statusCode = responseException.error.status;
      }
      const tempDocument = {
        '@timestamp': this.formatService.dateToISO({
          date: new Date(_timeRequest)
        }),
        application,
        applicationVersion,
        appStage,
        path,
        url,
        controller,
        handler,
        type,
        method,
        query,
        params,
        body,
        headers,
        cookies,
        requestDuration,
        statusCode,
        response
      };
      const elkDocument = this.redactElkDocument(tempDocument);
      await this.createIndexDocument(elkDocument);
    }
  }
  responseException(_request, _exception) {
    const apiPrefix = this.configService.get('config.project.apiPrefix');
    const instance = `${_.toUpper(_request.method)} ${_request.url}`;
    let status = common.HttpStatus.INTERNAL_SERVER_ERROR;
    let message;
    let detail;
    if (_exception instanceof common.HttpException) {
      status = _exception.getStatus();
      const exceptionResponse = filters.getErrorMessage(_exception.getResponse(), common.HttpStatus[status]);
      message = exceptionResponse.message;
      detail = exceptionResponse.detail;
    } else {
      message = _exception.message;
    }
    return {
      error: {
        status,
        instance,
        code: `${apiPrefix}-${filters.getCode(common.HttpStatus[status])}`,
        message,
        detail
      }
    };
  }
  /* Redact ELK Document*/
  redactElkDocument(_document) {
    const tempDocument = this.redactService.obfuscate(_document);
    tempDocument['query'] = JSON.stringify(tempDocument['query']);
    tempDocument['params'] = JSON.stringify(tempDocument['params']);
    tempDocument['body'] = JSON.stringify(tempDocument['body']);
    tempDocument['headers'] = JSON.stringify(tempDocument['headers']);
    tempDocument['cookies'] = JSON.stringify(tempDocument['cookies']);
    tempDocument['response'] = JSON.stringify(tempDocument['response']);
    return tempDocument;
  }
};
exports.ElkService = __decorate([common.Injectable(), __param(1, common.Inject(utils.FormatService)), __param(2, common.Inject(utils.RedactService)), __param(3, common.Inject(ELK_MODULE_OPTIONS)), __param(4, common.Inject(ELK_CLIENT)), __metadata("design:paramtypes", [config.ConfigService, utils.FormatService, utils.RedactService, Object, elasticsearch.Client])], exports.ElkService);

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
var __param$1 = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
var ElkModule_1;
exports.ElkModule = ElkModule_1 = class ElkModule {
  constructor(options, elkClient) {
    this.options = options;
    this.elkClient = elkClient;
  }
  static register(options) {
    return {
      global: true,
      module: ElkModule_1,
      imports: [utils.RedactModule.registerAsync({
        useFactory: options => (options === null || options === void 0 ? void 0 : options.redact) || {},
        inject: [ELK_MODULE_OPTIONS]
      })],
      providers: [createElkClient(), exports.ElkService, utils.RedactService, utils.FormatService, {
        provide: ELK_MODULE_OPTIONS,
        useValue: options
      }, {
        provide: ELK_MODULE_CLIENT_OPTIONS,
        useFactory: options => _.omit(options, ELK_OMITS_IN_OPTIONS),
        inject: [ELK_MODULE_OPTIONS]
      }],
      exports: [ELK_MODULE_OPTIONS, ELK_CLIENT, exports.ElkService]
    };
  }
  async onModuleDestroy() {
    await this.elkClient.close();
  }
};
exports.ElkModule = ElkModule_1 = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule, utils.RedactModule.registerAsync({
    useFactory: options => (options === null || options === void 0 ? void 0 : options.redact) || {},
    inject: [ELK_MODULE_OPTIONS]
  })],
  providers: [createElkClient(), exports.ElkService, utils.RedactService, utils.FormatService, {
    provide: ELK_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.elasticsearch'),
    inject: [config.ConfigService]
  }, {
    provide: ELK_MODULE_CLIENT_OPTIONS,
    useFactory: options => _.omit(options, ELK_OMITS_IN_OPTIONS),
    inject: [ELK_MODULE_OPTIONS]
  }],
  exports: [ELK_MODULE_OPTIONS, ELK_CLIENT, exports.ElkService]
}), __param$1(0, common.Inject(ELK_MODULE_OPTIONS)), __param$1(1, common.Inject(ELK_CLIENT)), __metadata$1("design:paramtypes", [Object, elasticsearch.Client])], exports.ElkModule);

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
exports.ElkInterceptor = class ElkInterceptor {
  constructor(elkService) {
    this.elkService = elkService;
  }
  intercept(_context, _next) {
    const timeRequest = Date.now();
    this.ctx = _context.switchToHttp();
    this.request = this.ctx.getRequest();
    this.response = this.ctx.getResponse();
    return _next.handle().pipe(rxjs.tap({
      next: async _response => {
        await this.elkService.serializeResponseInterceptor(timeRequest, _context, _response, false);
      },
      error: async _error => {
        await this.elkService.serializeResponseInterceptor(timeRequest, _context, _error, true);
      }
    }));
  }
};
exports.ElkInterceptor = __decorate$2([common.Injectable(), __metadata$2("design:paramtypes", [exports.ElkService])], exports.ElkInterceptor);

Object.keys(elasticsearch).forEach(function (k) {
  if (k !== 'default') Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () {
      return elasticsearch[k];
    }
  });
});
exports.ELK_CLIENT = ELK_CLIENT;
exports.ELK_MODULE_CLIENT_OPTIONS = ELK_MODULE_CLIENT_OPTIONS;
exports.ELK_MODULE_OPTIONS = ELK_MODULE_OPTIONS;
exports.ELK_MSG_ERROR_CONNECTED = ELK_MSG_ERROR_CONNECTED;
exports.ELK_MSG_SUCCESSFULLY_CONNECTED = ELK_MSG_SUCCESSFULLY_CONNECTED;
exports.ELK_OMITS_IN_OPTIONS = ELK_OMITS_IN_OPTIONS;
//# sourceMappingURL=index.js.map
