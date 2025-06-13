'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
require('@tresdoce-nestjs-toolkit/core');
var _ = _interopDefault(require('lodash'));
var path = require('path');
var fs = require('fs');
var swagger = require('@nestjs/swagger');

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

const CONFIG_OPTIONS = Symbol('CONFIG_OPTIONS');
const manifestControllerExcludes = [{
  path: '/info',
  method: common.RequestMethod.GET
}];

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
exports.ArchetypeService = class ArchetypeService {
  constructor(configService) {
    this.configService = configService;
  }
  async readFile(pathSegment, filename) {
    const file = path.resolve(pathSegment, filename);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  async getArchetypeVersion() {
    const {
      version
    } = await this.readFile(__dirname, '../package.json');
    return {
      archetypeVersion: version
    };
  }
  async getApplicationInfo() {
    const {
      project: {
        apiPrefix,
        name,
        version,
        description,
        author,
        repository,
        homepage
      },
      server: {
        appStage
      }
    } = this.configService;
    const {
      dependencies,
      devDependencies
    } = await this.readFile(process.cwd(), './package.json');
    const dependenciesList = _.pickBy(dependencies, (_value, _key) => _key.startsWith('@tresdoce-nestjs-toolkit') || _key.startsWith('@nestjs'));
    const devDependenciesList = _.pickBy(devDependencies, (_value, _key) => _key.startsWith('@tresdoce-nestjs-toolkit') || _key.startsWith('@nestjs'));
    return {
      appStage,
      apiPrefix,
      name,
      version,
      description,
      author,
      repository,
      homepage,
      dependencies: dependenciesList,
      devDependencies: devDependenciesList
    };
  }
  async generateManifest() {
    return _objectSpread2(_objectSpread2({}, await this.getArchetypeVersion()), await this.getApplicationInfo());
  }
};
exports.ArchetypeService = __decorate([common.Injectable(), __param(0, common.Inject(CONFIG_OPTIONS)), __metadata("design:paramtypes", [Object])], exports.ArchetypeService);

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
exports.ArchetypeController = class ArchetypeController {
  constructor(archetypeService) {
    this.archetypeService = archetypeService;
  }
  async getArchetypeInfo() {
    return this.archetypeService.generateManifest();
  }
};
__decorate$1([common.Get('info'), swagger.ApiExcludeEndpoint(), __metadata$1("design:type", Function), __metadata$1("design:paramtypes", []), __metadata$1("design:returntype", Promise)], exports.ArchetypeController.prototype, "getArchetypeInfo", null);
exports.ArchetypeController = __decorate$1([common.Controller(), __metadata$1("design:paramtypes", [exports.ArchetypeService])], exports.ArchetypeController);

var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.ArchetypeModule = class ArchetypeModule {};
exports.ArchetypeModule = __decorate$2([common.Global(), common.Module({
  imports: [config.ConfigModule],
  controllers: [exports.ArchetypeController],
  exports: [CONFIG_OPTIONS, exports.ArchetypeController],
  providers: [exports.ArchetypeController, exports.ArchetypeService, {
    provide: CONFIG_OPTIONS,
    useFactory: async configService => configService.get('config'),
    inject: [config.ConfigService]
  }]
})], exports.ArchetypeModule);

exports.CONFIG_OPTIONS = CONFIG_OPTIONS;
exports.manifestControllerExcludes = manifestControllerExcludes;
//# sourceMappingURL=index.js.map
