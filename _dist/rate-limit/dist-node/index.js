'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var throttler = require('@nestjs/throttler');

const RATE_LIMIT_MODULE_OPTIONS = Symbol.for('RATE_LIMIT_MODULE_OPTIONS');

var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.RateLimitModule = class RateLimitModule {};
exports.RateLimitModule = __decorate([common.Global(), common.Module({
  imports: [config.ConfigModule, throttler.ThrottlerModule.forRootAsync({
    useFactory: async configService => configService.get('config.server.rateLimits'),
    inject: [config.ConfigService]
  })],
  providers: [{
    provide: RATE_LIMIT_MODULE_OPTIONS,
    useFactory: async configService => configService.get('config.server.rateLimits'),
    inject: [config.ConfigService]
  }],
  exports: [RATE_LIMIT_MODULE_OPTIONS, throttler.ThrottlerModule]
})], exports.RateLimitModule);

Object.keys(throttler).forEach(function (k) {
    if (k !== 'default') Object.defineProperty(exports, k, {
        enumerable: true,
        get: function () {
            return throttler[k];
        }
    });
});
//# sourceMappingURL=index.js.map
