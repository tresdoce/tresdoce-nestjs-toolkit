'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var config = require('@nestjs/config');
var operators = require('rxjs/operators');
var _ = _interopDefault(require('lodash'));

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
exports.ResponseInterceptor = class ResponseInterceptor {
  constructor(configService) {
    this.configService = configService;
  }
  intercept(_context, _next) {
    const ctx = _context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const propagateHeadersList = this.configService.get('config.server.propagateHeaders') || [];
    for (const propagateHeader of propagateHeadersList) {
      const headerName = propagateHeader.trim().toLowerCase();
      if (request.headers[headerName]) {
        response.setHeader(headerName, request.headers[headerName]);
      }
    }
    return _next.handle().pipe(operators.map(_res => {
      return _.isArray(_res) ? {
        data: _res
      } : _res;
    }));
  }
};
exports.ResponseInterceptor = __decorate([common.Injectable(), __metadata("design:paramtypes", [config.ConfigService])], exports.ResponseInterceptor);
//# sourceMappingURL=index.js.map
