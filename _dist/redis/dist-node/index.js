'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var redis = require('redis');
var uuid = require('uuid');

const REDIS_MODULE_OPTIONS = Symbol('REDIS_MODULE_OPTIONS');
const REDIS_CLIENT = Symbol('REDIS_CLIENT');
const REDIS_MSG_IS_READY = 'Redis is ready!';
const REDIS_MSG_SUCCESSFULLY_CONNECTED = 'Connected to Redis successfully!';
const REDIS_MSG_ERROR_CONNECTED = 'Could not establish a connection with Redis:';

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
exports.RedisService = class RedisService {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }
  get clientRef() {
    return this.redisClient;
  }
  /**
   * @Descripción: Return echo message
   * @Param msg {string}
   * @return: String
   */
  async echo(msg) {
    return this.clientRef.echo(msg);
  }
  /**
   * @Descripción: Return if exist key in Redis
   * @Param key {string}
   * @return: true | false
   */
  async exists(key) {
    return Boolean(await this.clientRef.exists(key));
  }
  /**
   * @Descripción: Save value in Redis
   * @Param key {string}
   * @Param value {any}
   * @Param seconds {number} expire data
   * @return: OK
   */
  async set(key, value, seconds) {
    const stringValue = JSON.stringify(value);
    return seconds ? await this.clientRef.setEx(key, seconds, stringValue) : await this.clientRef.set(key, stringValue);
  }
  /**
   * @Descripción: Get value of Redis by key
   * @param key {string}
   * @return:
   */
  async get(key) {
    const data = await this.clientRef.get(key);
    return data ? JSON.parse(data) : null;
  }
  /**
   * @Descripción: Delete data of Redis by key
   * @param key {string}
   * @return: true | false
   */
  async del(key) {
    return Boolean(await this.clientRef.del(key));
  }
  /**
   * @Descripción: Copy value in new key
   * @param source {string}
   * @param destination {string}
   * @return: true | false
   */
  async copy(source, destination) {
    const result = await this.clientRef.copy(source, destination);
    return result === 1;
  }
  /**
   * @Descripción: Rename key
   * @param key {string}
   * @param newKey {string}
   * @return: OK
   */
  async rename(key, newKey) {
    return this.clientRef.rename(key, newKey);
  }
  /**
   * @Descripción: Delete all Redis
   * @return: OK
   */
  async flushAll() {
    return this.clientRef.flushAll();
  }
};
exports.RedisService = __decorate([common.Injectable(), __param(0, common.Inject(REDIS_CLIENT)), __metadata("design:paramtypes", [Object])], exports.RedisService);

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

const createRedisClient = () => ({
  provide: REDIS_CLIENT,
  useFactory: async options => {
    const {
      protocol = 'redis',
      host,
      port,
      username,
      password,
      database,
      name = uuid.v4()
    } = options;
    // redis[s]://[[username][:password]@][host][:port][/db-number]
    const redisUsername = username ? `${username}` : '';
    const redisPassword = password ? `:${password}@` : '';
    const db = database ? `/${database}` : '';
    const url = `${protocol}://${redisUsername}${redisPassword}${host}:${port}${db}`;
    const client = redis.createClient(_objectSpread2(_objectSpread2({}, options), {}, {
      url,
      name
    }));
    await client.connect();
    /* istanbul ignore next */
    client.on('ready', () => common.Logger.log(REDIS_MSG_IS_READY));
    /* istanbul ignore next */
    client.on('connect', () => common.Logger.log(REDIS_MSG_SUCCESSFULLY_CONNECTED));
    /* istanbul ignore next */
    client.on('error', error => common.Logger.error(`${REDIS_MSG_ERROR_CONNECTED} ${error}`));
    return client;
  },
  inject: [REDIS_MODULE_OPTIONS]
});

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
var RedisModule_1;
exports.RedisModule = RedisModule_1 = class RedisModule {
  constructor(options, redisClient) {
    this.options = options;
    this.redisClient = redisClient;
  }
  static register(options) {
    return {
      global: true,
      module: RedisModule_1,
      providers: [createRedisClient(), exports.RedisService, {
        provide: REDIS_MODULE_OPTIONS,
        useValue: options
      }],
      exports: [REDIS_CLIENT, exports.RedisService]
    };
  }
  async onModuleDestroy() {
    await this.redisClient.quit();
  }
};
exports.RedisModule = RedisModule_1 = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [createRedisClient(), exports.RedisService, {
    provide: REDIS_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.redis'),
    inject: [config.ConfigService]
  }],
  exports: [REDIS_CLIENT, exports.RedisService]
}), __param$1(0, common.Inject(REDIS_MODULE_OPTIONS)), __param$1(1, common.Inject(REDIS_CLIENT)), __metadata$1("design:paramtypes", [Object, Object])], exports.RedisModule);

Object.keys(redis).forEach(function (k) {
    if (k !== 'default') Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
            return redis[k];
        }
    });
});
exports.REDIS_CLIENT = REDIS_CLIENT;
exports.REDIS_MODULE_OPTIONS = REDIS_MODULE_OPTIONS;
exports.REDIS_MSG_ERROR_CONNECTED = REDIS_MSG_ERROR_CONNECTED;
exports.REDIS_MSG_IS_READY = REDIS_MSG_IS_READY;
exports.REDIS_MSG_SUCCESSFULLY_CONNECTED = REDIS_MSG_SUCCESSFULLY_CONNECTED;
//# sourceMappingURL=index.js.map
