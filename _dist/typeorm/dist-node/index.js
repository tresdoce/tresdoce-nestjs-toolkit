'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var typeorm = require('@nestjs/typeorm');
var typeorm$1 = require('typeorm');
var common$1 = require('@nestjs/typeorm/dist/common');
var interfaces = require('@nestjs/typeorm/dist/interfaces');

const TYPE_ORM_MODULE_OPTIONS = 'TYPE_ORM_MODULE_OPTIONS';

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.TypeOrmClientModule = class TypeOrmClientModule {
  static forFeature(features) {
    return typeorm.TypeOrmModule.forFeature(features);
  }
};
exports.TypeOrmClientModule = __decorate([common.Global(), common.Module({
  imports: [config.ConfigModule, typeorm.TypeOrmModule.forRootAsync({
    useFactory: async options => options,
    inject: [TYPE_ORM_MODULE_OPTIONS]
  })],
  providers: [{
    provide: TYPE_ORM_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.database.typeorm'),
    inject: [config.ConfigService]
  }],
  exports: [typeorm.TypeOrmModule, TYPE_ORM_MODULE_OPTIONS]
})], exports.TypeOrmClientModule);

Object.keys(typeorm$1).forEach(function (k) {
    if (k !== 'default') Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
            return typeorm$1[k];
        }
    });
});
Object.keys(common$1).forEach(function (k) {
    if (k !== 'default') Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
            return common$1[k];
        }
    });
});
Object.keys(interfaces).forEach(function (k) {
    if (k !== 'default') Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
            return interfaces[k];
        }
    });
});
//# sourceMappingURL=index.js.map
