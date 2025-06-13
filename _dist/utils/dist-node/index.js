'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var fastRedact = _interopDefault(require('fast-redact'));
var luxon = require('luxon');
var bcrypt = require('bcrypt');

const REDACT_MODULE_OPTIONS = Symbol('REDACT_MODULE_OPTIONS');
const REDACT_PROVIDER = Symbol('REDACT_PROVIDER');
const DEFAULT_CENSOR = '****';
const DEFAULT_OPTIONS_REDACT = {
  paths: [],
  obfuscateFrom: 'right',
  censor: DEFAULT_CENSOR,
  remove: false,
  strict: false,
  serialize: false
};

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

const redactProvider = () => ({
  provide: REDACT_PROVIDER,
  useFactory: async _options => {
    const redactOptions = _objectSpread2(_objectSpread2({}, DEFAULT_OPTIONS_REDACT), _options || {});
    const obfuscatedFrom = _value => {
      return redactOptions.obfuscateFrom === 'right' ? `${_value.toString().substring(0, _value.length - redactOptions.censor.length)}${redactOptions.censor}` : `${redactOptions.censor}${_value.toString().substring(redactOptions.censor.length)}`;
    };
    const censor = typeof redactOptions.censor === 'string' ? _value => obfuscatedFrom(_value) : redactOptions.censor;
    return fastRedact(_objectSpread2(_objectSpread2({}, redactOptions), {}, {
      censor
    }));
  },
  inject: [REDACT_MODULE_OPTIONS]
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
exports.RedactService = class RedactService {
  constructor(redact) {
    this.redact = redact;
  }
  get redactRef() {
    /* istanbul ignore next */
    return this.redact ? this.redact : null;
  }
  /*
   * Obfuscate data
   */
  obfuscate(_data, _serialize = true) {
    const tempData = JSON.parse(JSON.stringify(_data));
    const dataRedacted = this.redactRef(tempData);
    return _serialize ? dataRedacted : JSON.stringify(dataRedacted);
  }
};
exports.RedactService = __decorate([common.Injectable(), __param(0, common.Inject(REDACT_PROVIDER)), __metadata("design:paramtypes", [Object])], exports.RedactService);

var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RedactModule_1;
exports.RedactModule = RedactModule_1 = class RedactModule {
  static register(_options) {
    return {
      global: true,
      module: RedactModule_1,
      providers: [redactProvider(), exports.RedactService, {
        provide: REDACT_MODULE_OPTIONS,
        useValue: _options
      }],
      exports: [REDACT_PROVIDER, exports.RedactService]
    };
  }
  static registerAsync(_options) {
    return {
      global: true,
      module: RedactModule_1,
      imports: _options.imports,
      providers: [redactProvider(), exports.RedactService, ...this.createAsyncProviders(_options)],
      exports: [REDACT_PROVIDER, exports.RedactService]
    };
  }
  static createAsyncProviders(_options) {
    if (_options.useFactory) {
      return [this.createAsyncOptionsProvider(_options)];
    }
    return [this.createAsyncOptionsProvider(_options), {
      provide: _options.useClass,
      useClass: _options.useClass
    }];
  }
  static createAsyncOptionsProvider(_options) {
    if (_options.useFactory) {
      return {
        provide: REDACT_MODULE_OPTIONS,
        useFactory: _options.useFactory,
        inject: _options.inject || []
      };
    }
    return {
      provide: REDACT_MODULE_OPTIONS,
      useFactory: async _optionsFactory => _optionsFactory.createRedactOptions(),
      inject: [_options.useClass]
    };
  }
};
exports.RedactModule = RedactModule_1 = __decorate$1([common.Global(), common.Module({
  imports: [config.ConfigModule],
  providers: [redactProvider(), exports.RedactService, {
    provide: REDACT_MODULE_OPTIONS,
    useFactory: async _configService => _configService.get('config.redact') || null,
    inject: [config.ConfigService]
  }],
  exports: [REDACT_PROVIDER, exports.RedactService]
})], exports.RedactModule);

const DEFAULT_TIMEZONE = 'utc';
const DEFAULT_LOCALE = 'es-AR';
const DEFAULT_TIMEZONE_LOCALE = 'America/Argentina/Buenos_Aires';
const DEFAULT_FORMAT_DATE = 'dd/LL/yyyy TT.SSS';
const DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF = {
  unit: 'milliseconds',
  addSuffix: false
};

var TimeSuffixes;
(function (TimeSuffixes) {
  TimeSuffixes["milliseconds"] = "ms";
  TimeSuffixes["seconds"] = "s";
  TimeSuffixes["minutes"] = "min";
  TimeSuffixes["hours"] = "h";
  TimeSuffixes["days"] = "d";
  TimeSuffixes["weeks"] = "w";
  TimeSuffixes["months"] = "mo";
  TimeSuffixes["years"] = "y";
})(TimeSuffixes || (TimeSuffixes = {}));

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.FormatService = class FormatService {
  /**
   * @Descripción: Return number with format
   * @Param _options {FormatNumberOptions}
   * @return: string
   */
  formatNumber(_options) {
    const {
      num,
      locale = DEFAULT_LOCALE,
      formatOptions
    } = _options;
    return new Intl.NumberFormat(locale, formatOptions).format(num).replace(/\u00A0/g, ' ');
  }
  /**
   * @Descripción: Return luxon DateTime instance
   * @return: DateTime
   */
  dateTimeRef() {
    return luxon.DateTime;
  }
  /**
   * @Descripción: Return date with format
   * @Param _options {FormatDateOptions}
   * @return: string
   */
  formatDate(_options) {
    const {
      date,
      formatDate = DEFAULT_FORMAT_DATE,
      timezone = DEFAULT_TIMEZONE,
      locale = DEFAULT_LOCALE
    } = _options;
    return this.dateTimeRef().fromJSDate(date, {
      zone: timezone
    }).setLocale(locale).toFormat(formatDate);
  }
  /**
   * @Descripción: Return convert date to ISO
   * @Param _options {ISOFormatDateOptions}
   * @return: string
   */
  dateToISO(_options) {
    const {
      date,
      timezone = DEFAULT_TIMEZONE
    } = _options;
    return this.dateTimeRef().fromJSDate(date, {
      zone: timezone
    }).toISO();
  }
  /**
   * @Descripción: Return diff between two timestamps
   * @Param _options {CalculateTimestampDiffOptions}
   * @return: string | number
   */
  calculateTimestampDiff(_options) {
    const {
      startTime,
      endTime,
      options
    } = _options;
    const diffOptions = _objectSpread2(_objectSpread2({}, DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF), options);
    const start = this.dateTimeRef().fromMillis(startTime);
    const end = this.dateTimeRef().fromMillis(endTime);
    const duration = end.diff(start).as(diffOptions.unit);
    return diffOptions.addSuffix ? `${duration}${TimeSuffixes[diffOptions.unit]}` : duration;
  }
};
exports.FormatService = __decorate$2([common.Injectable()], exports.FormatService);

var __decorate$3 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.FormatModule = class FormatModule {};
exports.FormatModule = __decorate$3([common.Global(), common.Module({
  providers: [exports.FormatService],
  exports: [exports.FormatService]
})], exports.FormatModule);

const BCRYPT_MODULE_OPTIONS = Symbol('BCRYPT_MODULE_OPTIONS');
const DEFAULT_SALT_ROUNDS = 16;
const DEFAULT_MINOR = 'b';
const BCRYPT_DEFAULT_OPTIONS = {
  rounds: DEFAULT_SALT_ROUNDS,
  minor: DEFAULT_MINOR
};

var __decorate$4 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
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
exports.BcryptService = class BcryptService {
  constructor(options) {
    this.options = options;
    this.generateSalt();
  }
  /**
   * Generates a new salt.
   * @param rounds The cost of processing the data.
   * @param minor The minor version of bcrypt to use.
   * @returns The generated salt.
   * @throws Error if an error occurs during salt generation.
   */
  generateSalt(rounds = this.options.rounds, minor = this.options.minor) {
    try {
      this.salt = bcrypt.genSaltSync(rounds, minor);
      return this.salt;
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error generating salt: ${_error.message}`);
    }
  }
  /**
   * Encrypts data using bcrypt asynchronously.
   * @param data The data to encrypt.
   * @returns A Promise that resolves to the encrypted data.
   * @throws Error if an error occurs during encryption.
   */
  async encrypt(data) {
    try {
      return await bcrypt.hash(data, this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error encrypting data: ${_error.message}`);
    }
  }
  /**
   * Encrypts data using bcrypt synchronously.
   * @param data The data to encrypt.
   * @returns The encrypted data.
   * @throws Error if an error occurs during encryption.
   */
  encryptSync(data) {
    try {
      return bcrypt.hashSync(data, this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error synchronously encrypting data: ${_error.message}`);
    }
  }
  /**
   * Compares data with encrypted data using bcrypt asynchronously.
   * @param data The data to compare.
   * @param encryptedData The encrypted data.
   * @returns A Promise that resolves to true if the data matches the encrypted data, false otherwise.
   * @throws Error if an error occurs during comparison.
   */
  async compare(data, encryptedData) {
    try {
      return await bcrypt.compare(data, encryptedData);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error comparing data: ${_error.message}`);
    }
  }
  /**
   * Compares data with encrypted data using bcrypt synchronously.
   * @param data The data to compare.
   * @param encryptedData The encrypted data.
   * @returns True if the data matches the encrypted data, false otherwise.
   * @throws Error if an error occurs during comparison.
   */
  compareSync(data, encryptedData) {
    try {
      return bcrypt.compareSync(data, encryptedData);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error synchronously comparing data: ${_error.message}`);
    }
  }
  /**
   * Generates a secure hash for a password using bcrypt.
   * @param password The password to hash.
   * @returns The hashed password.
   * @throws Error if an error occurs during hash generation.
   */
  generatePasswordHash(password) {
    try {
      return bcrypt.hashSync(password, this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error generating password hash: ${_error.message}`);
    }
  }
  /**
   * Validates if a hash is valid for the current salt rounds.
   * @param hash The hash to validate.
   * @returns True if the hash is valid, false otherwise.
   * @throws Error if an error occurs during hash validation.
   * @example
   * const isValid = bcryptService.validateHash('$2b$10$M2ZUWr3YlD3uEZuGZ7oMdObk0jOcoBCK6a2jthqWak36KoQFYIzR6');
   */
  validateHash(hash) {
    try {
      return bcrypt.getRounds(hash) === bcrypt.getRounds(this.salt);
    } catch (_error) {
      /* istanbul ignore next */
      throw new Error(`Error validating hash: ${_error.message}`);
    }
  }
};
exports.BcryptService = __decorate$4([common.Injectable(), __param$1(0, common.Inject(BCRYPT_MODULE_OPTIONS)), __metadata$1("design:paramtypes", [Object])], exports.BcryptService);

var __decorate$5 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.BcryptModule = class BcryptModule {};
exports.BcryptModule = __decorate$5([common.Global(), common.Module({
  providers: [exports.BcryptService, {
    provide: BCRYPT_MODULE_OPTIONS,
    useFactory: async _configService => _objectSpread2(_objectSpread2({}, BCRYPT_DEFAULT_OPTIONS), _configService.get('config.bcrypt')),
    inject: [config.ConfigService]
  }],
  exports: [exports.BcryptService]
})], exports.BcryptModule);

exports.BCRYPT_DEFAULT_OPTIONS = BCRYPT_DEFAULT_OPTIONS;
exports.BCRYPT_MODULE_OPTIONS = BCRYPT_MODULE_OPTIONS;
exports.DEFAULT_CENSOR = DEFAULT_CENSOR;
exports.DEFAULT_FORMAT_DATE = DEFAULT_FORMAT_DATE;
exports.DEFAULT_LOCALE = DEFAULT_LOCALE;
exports.DEFAULT_MINOR = DEFAULT_MINOR;
exports.DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF = DEFAULT_OPTIONS_CALCULATE_TIMESTAMP_DIFF;
exports.DEFAULT_OPTIONS_REDACT = DEFAULT_OPTIONS_REDACT;
exports.DEFAULT_SALT_ROUNDS = DEFAULT_SALT_ROUNDS;
exports.DEFAULT_TIMEZONE = DEFAULT_TIMEZONE;
exports.DEFAULT_TIMEZONE_LOCALE = DEFAULT_TIMEZONE_LOCALE;
exports.REDACT_MODULE_OPTIONS = REDACT_MODULE_OPTIONS;
exports.REDACT_PROVIDER = REDACT_PROVIDER;
//# sourceMappingURL=index.js.map
