'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var common = require('@nestjs/common');
var core = require('@tresdoce-nestjs-toolkit/core');
var _ = _interopDefault(require('lodash'));

/**
 *
 * Extract the stringifies error code
 *
 * @param exResponse - exception response
 * @returns - string that describes the error
 */
const getCode = exResponse => {
  if (typeof exResponse === 'string') {
    return formatErrorCode(exResponse);
  }
  if ('error' in exResponse && typeof exResponse.error === 'string') {
    return formatErrorCode(exResponse.error);
  }
  return formatErrorCode(common.HttpStatus[common.HttpStatus.INTERNAL_SERVER_ERROR]);
};
/**
 * Format a string to uppercase and snakeCase
 *
 * @param error - string
 * @returns - ex `Bad Request` become `BAD_REQUEST`
 */
const formatErrorCode = error => {
  return _.toUpper(_.snakeCase(error));
};
/**
 *
 * Extract the error messages
 *
 */
const getErrorMessage = (exceptionResponse, httpStatus) => {
  let message;
  let detail;
  if (typeof exceptionResponse === 'string') {
    message = exceptionResponse;
  } else {
    if (_.isArray(exceptionResponse.message)) {
      message = exceptionResponse.error;
      detail = _.map(exceptionResponse.message, _message => ({
        message: _message
      }));
    } else {
      message = exceptionResponse.message;
      detail = exceptionResponse.error;
    }
  }
  return {
    message: message || _.startCase(_.toLower(httpStatus)),
    detail
  };
};

const PROBLEM_CONTENT_TYPE = 'application/problem+json';

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
exports.ExceptionsFilter = class ExceptionsFilter {
  constructor(appConfig) {
    this.appConfig = appConfig;
  }
  catch(_exception, _host) {
    var _this$appConfig;
    const excludePathsList = core.excludePaths();
    const ctx = _host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const apiPrefix = ((_this$appConfig = this.appConfig) === null || _this$appConfig === void 0 ? void 0 : _this$appConfig.project.apiPrefix) || 'API-PREFIX';
    const instance = `${_.toUpper(request.method)} ${request.url}`;
    let status = common.HttpStatus.INTERNAL_SERVER_ERROR;
    let message, detail;
    if (excludePathsList.includes(request.url)) {
      if (_exception instanceof common.HttpException) {
        response.status(_exception.getStatus()).json(_exception.getResponse());
      }
      return;
    }
    if (_exception instanceof common.HttpException) {
      status = _exception.getStatus();
      const exceptionResponse = getErrorMessage(_exception.getResponse(), common.HttpStatus[status]);
      message = exceptionResponse.message;
      detail = exceptionResponse.detail;
    } else {
      const error = _exception;
      message = error.message;
    }
    response.type(PROBLEM_CONTENT_TYPE).status(status).json({
      error: {
        status,
        instance,
        code: `${apiPrefix}-${getCode(common.HttpStatus[status])}`,
        message,
        detail
      }
    });
  }
};
exports.ExceptionsFilter = __decorate([common.Injectable(), common.Catch(), __metadata("design:paramtypes", [Object])], exports.ExceptionsFilter);

exports.PROBLEM_CONTENT_TYPE = PROBLEM_CONTENT_TYPE;
exports.getCode = getCode;
exports.getErrorMessage = getErrorMessage;
//# sourceMappingURL=index.js.map
