'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var axios = require('@nestjs/axios');
var terminus = require('@nestjs/terminus');
var swagger = require('@nestjs/swagger');
var tracing = require('@tresdoce-nestjs-toolkit/tracing');
var core = require('@tresdoce-nestjs-toolkit/core');
var microservices = require('@nestjs/microservices');
var _ = _interopDefault(require('lodash'));
var url = require('url');

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
class LivenessResponse {}
__decorate([swagger.ApiProperty({
  example: 'up',
  description: 'The status of the service'
}), __metadata("design:type", String)], LivenessResponse.prototype, "status", void 0);

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
let LivenessController = class LivenessController {
  getLiveness() {
    return {
      status: 'up'
    };
  }
};
__decorate$1([common.Get('liveness'), core.Public(), tracing.SkipTrace(), swagger.ApiOperation({
  summary: 'Liveness check',
  description: 'This endpoint returns the liveness status of the service. It is used to check if the service is alive.',
  operationId: 'checkLiveness'
}), swagger.ApiResponse({
  status: 200,
  description: 'The service is live.',
  type: LivenessResponse,
  schema: {
    example: {
      status: 'up'
    }
  }
}), swagger.ApiResponse({
  status: 500,
  description: 'Internal server error.'
}), __metadata$1("design:type", Function), __metadata$1("design:paramtypes", []), __metadata$1("design:returntype", void 0)], LivenessController.prototype, "getLiveness", null);
LivenessController = __decorate$1([common.Controller('health'), swagger.ApiTags('Monitoring')], LivenessController);

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

const CONFIG_OPTIONS = 'CONFIG_OPTIONS';
const DEFAULT_SERVICE_LIVENESS_PATH = '/health/liveness';
const controllersExcludes = [{
  path: '/health/liveness',
  method: common.RequestMethod.GET
}, {
  path: '/health/readiness',
  method: common.RequestMethod.GET
}];

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
var __param = undefined && undefined.__param || function (paramIndex, decorator) {
  return function (target, key) {
    decorator(target, key, paramIndex);
  };
};
let ReadinessController = class ReadinessController {
  constructor(appConfig, disk, memory, health, http, typeOrm, microservice) {
    this.appConfig = appConfig;
    this.disk = disk;
    this.memory = memory;
    this.health = health;
    this.http = http;
    this.typeOrm = typeOrm;
    this.microservice = microservice;
  }
  async check() {
    return this.health.check([...this.getDiskChecks(), ...this.getMemoryChecks(), ...this.getServicesPingChecks(), ...this.getTypeOrmChecks(), ...this.getRedisChecks(), ...this.getElkChecks(), ...this.getCamundaChecks()]);
  }
  getDiskChecks() {
    if (!_.has(this.appConfig.health, 'storage') || _.isEmpty(this.appConfig.health.storage) || _.includes(this.appConfig.health.skipChecks, 'storage')) return [];
    const {
      storage
    } = this.appConfig.health;
    /* istanbul ignore next */
    if (!Object.keys(storage).length) return [];
    /* istanbul ignore next */
    return [async () => this.disk.checkStorage('storage', _objectSpread2({}, storage))];
  }
  getMemoryChecks() {
    if (!_.has(this.appConfig.health, 'memory') || _.isEmpty(this.appConfig.health.memory) || _.includes(this.appConfig.health.skipChecks, 'memory')) return [];
    const {
      memory
    } = this.appConfig.health;
    /* istanbul ignore next */
    if (!Object.keys(memory).length) return [];
    /* istanbul ignore next */
    return [async () => this.memory.checkHeap('memory_heap', memory.heap), async () => this.memory.checkRSS('memory_rss', memory.rss)];
  }
  getServicesPingChecks() {
    /* istanbul ignore next */
    if (!_.has(this.appConfig, 'services') || _.isEmpty(this.appConfig.services)) return [];
    const {
      services
    } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(services).length) return [];
    /* istanbul ignore next */
    return Object.entries(services).map(([_key, _service]) => {
      const {
        url: url$1,
        timeout = 0,
        healthPath = DEFAULT_SERVICE_LIVENESS_PATH
      } = _service;
      const urlService = new url.URL(url$1);
      return async () => this.http.pingCheck(`service-${_key}`, `${urlService.origin}${healthPath}`, {
        timeout
      });
    });
  }
  getTypeOrmChecks() {
    if (!_.has(this.appConfig, 'database.typeorm') || _.isEmpty(this.appConfig.database.typeorm) || _.includes(this.appConfig.health.skipChecks, 'typeorm')) return [];
    const {
      database: {
        typeorm
      }
    } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(typeorm).length) return [];
    /* istanbul ignore next */
    return [async () => this.typeOrm.pingCheck(`typeorm-${typeorm.type}`)];
  }
  getRedisChecks() {
    if (!_.has(this.appConfig, 'redis') || _.isEmpty(this.appConfig.redis) || _.includes(this.appConfig.health.skipChecks, 'redis')) return [];
    const {
      redis
    } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(redis).length) return [];
    /* istanbul ignore next */
    const redisName = _.has(redis, 'name') && !_.isEmpty(redis.name) ? `redis-${redis.name}` : 'redis';
    /* istanbul ignore next */
    return [async () => this.microservice.pingCheck(redisName, {
      transport: microservices.Transport.REDIS,
      options: _objectSpread2({}, redis)
    })];
  }
  getElkChecks() {
    if (!_.has(this.appConfig, 'elasticsearch') || _.isEmpty(this.appConfig.elasticsearch) || _.includes(this.appConfig.health.skipChecks, 'elasticsearch')) return [];
    const {
      elasticsearch
    } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(elasticsearch).length) return [];
    /* istanbul ignore next */
    const options = _.has(elasticsearch, 'auth') && !_.isEmpty(elasticsearch.auth) ? {
      auth: elasticsearch.auth
    } : {};
    /* istanbul ignore next */
    return [async () => this.http.pingCheck(`elasticsearch`, `${elasticsearch.node}`, options)];
  }
  getCamundaChecks() {
    if (!_.has(this.appConfig, 'camunda') || _.isEmpty(this.appConfig.camunda) || _.includes(this.appConfig.health.skipChecks, 'camunda')) return [];
    const {
      camunda
    } = this.appConfig;
    /* istanbul ignore next */
    if (!Object.keys(camunda).length) return [];
    /* istanbul ignore next */
    return [async () => this.http.pingCheck(`camunda`, `${camunda.baseUrl}/version`)];
  }
};
__decorate$2([common.Get('readiness'), swagger.ApiExcludeEndpoint(), swagger.ApiOperation({
  summary: 'Readiness check',
  description: 'This endpoint returns the readiness status of the service. It is used to check if the service is ready to accept traffic.',
  operationId: 'checkReadiness'
}), terminus.HealthCheck(), tracing.SkipTrace(), __metadata$2("design:type", Function), __metadata$2("design:paramtypes", []), __metadata$2("design:returntype", Promise)], ReadinessController.prototype, "check", null);
ReadinessController = __decorate$2([common.Controller('health'), swagger.ApiTags('Monitoring'), __param(0, common.Inject(CONFIG_OPTIONS)), __metadata$2("design:paramtypes", [Object, terminus.DiskHealthIndicator, terminus.MemoryHealthIndicator, terminus.HealthCheckService, terminus.HttpHealthIndicator, terminus.TypeOrmHealthIndicator, terminus.MicroserviceHealthIndicator])], ReadinessController);

var __decorate$3 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.HealthModule = class HealthModule {};
exports.HealthModule = __decorate$3([common.Global(), common.Module({
  imports: [config.ConfigModule, terminus.TerminusModule, axios.HttpModule],
  controllers: [LivenessController, ReadinessController],
  exports: [LivenessController, ReadinessController],
  providers: [LivenessController, ReadinessController, {
    provide: CONFIG_OPTIONS,
    useFactory: async configService => configService.get('config'),
    inject: [config.ConfigService]
  }]
})], exports.HealthModule);

exports.CONFIG_OPTIONS = CONFIG_OPTIONS;
exports.DEFAULT_SERVICE_LIVENESS_PATH = DEFAULT_SERVICE_LIVENESS_PATH;
exports.controllersExcludes = controllersExcludes;
//# sourceMappingURL=index.js.map
