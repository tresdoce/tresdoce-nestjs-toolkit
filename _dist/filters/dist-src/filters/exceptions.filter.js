var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Catch, HttpException, HttpStatus, Injectable, } from '@nestjs/common';
import { Typings, excludePaths } from '@tresdoce-nestjs-toolkit/core';
import _ from 'lodash';
import { getCode, getErrorMessage } from './utils/error.utils';
import { PROBLEM_CONTENT_TYPE } from './constants/filters.constants';
let ExceptionsFilter = class ExceptionsFilter {
    constructor(appConfig) {
        this.appConfig = appConfig;
    }
    catch(_exception, _host) {
        const excludePathsList = excludePaths();
        const ctx = _host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const apiPrefix = this.appConfig?.project.apiPrefix || 'API-PREFIX';
        const instance = `${_.toUpper(request.method)} ${request.url}`;
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message, detail;
        if (excludePathsList.includes(request.url)) {
            if (_exception instanceof HttpException) {
                response.status(_exception.getStatus()).json(_exception.getResponse());
            }
            return;
        }
        if (_exception instanceof HttpException) {
            status = _exception.getStatus();
            const exceptionResponse = getErrorMessage(_exception.getResponse(), HttpStatus[status]);
            message = exceptionResponse.message;
            detail = exceptionResponse.detail;
        }
        else {
            const error = _exception;
            message = error.message;
        }
        response
            .type(PROBLEM_CONTENT_TYPE)
            .status(status)
            .json({
            error: {
                status,
                instance,
                code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
                message,
                detail,
            },
        });
    }
};
ExceptionsFilter = __decorate([
    Injectable(),
    Catch(),
    __metadata("design:paramtypes", [Object])
], ExceptionsFilter);
export { ExceptionsFilter };
