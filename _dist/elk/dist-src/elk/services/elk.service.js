var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { HttpException, HttpStatus, Inject, Injectable, Logger, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getCode, getErrorMessage } from '@tresdoce-nestjs-toolkit/filters';
import { excludePaths } from '@tresdoce-nestjs-toolkit/core';
import { FormatService, RedactService } from '@tresdoce-nestjs-toolkit/utils';
import { Client } from '@elastic/elasticsearch';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import { ELK_MODULE_OPTIONS, ELK_CLIENT } from '../constants/elk.constant';
let ElkService = class ElkService {
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
        const { indexDate = true, name } = this.options;
        /* istanbul ignore next */
        const indexName = _suffix
            ? [`${name.toString()}`, _suffix].join('-')
            : `${name.toString()}`;
        const currentDate = this.formatService.formatDate({
            date: new Date(),
            formatDate: 'yyyy.LL.dd',
        });
        return indexDate ? `${indexName}-${currentDate}` : `${indexName}`;
    }
    /*
     * Create index document
     */
    async createIndexDocument(elkDocument, _suffix) {
        try {
            await this.clientRef?.index({
                index: this.generateIndexDocument(_suffix),
                id: `${uuid()}`,
                document: elkDocument,
            });
        }
        catch (_error) {
            /* istanbul ignore next */
            Logger.error(`Create document: ${_error.message}`, 'ElkModule');
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
            endTime: Date.now(),
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
            response: !_isException ? res.getHeaders() : {},
        };
        const path = `${req.path}`;
        const url = `${req.url}`;
        const method = `${req.method}`;
        let statusCode = res.statusCode;
        let response = _response;
        if (_.isUndefined(excludePaths().find((path) => _.startsWith(req.path, path)))) {
            if (_isException) {
                const responseException = this.responseException(req, _response);
                response = responseException;
                statusCode = responseException.error.status;
            }
            const tempDocument = {
                '@timestamp': this.formatService.dateToISO({ date: new Date(_timeRequest) }),
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
                response,
            };
            const elkDocument = this.redactElkDocument(tempDocument);
            await this.createIndexDocument(elkDocument);
        }
    }
    responseException(_request, _exception) {
        const apiPrefix = this.configService.get('config.project.apiPrefix');
        const instance = `${_.toUpper(_request.method)} ${_request.url}`;
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message;
        let detail;
        if (_exception instanceof HttpException) {
            status = _exception.getStatus();
            const exceptionResponse = getErrorMessage(_exception.getResponse(), HttpStatus[status]);
            message = exceptionResponse.message;
            detail = exceptionResponse.detail;
        }
        else {
            message = _exception.message;
        }
        return {
            error: {
                status,
                instance,
                code: `${apiPrefix}-${getCode(HttpStatus[status])}`,
                message,
                detail,
            },
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
ElkService = __decorate([
    Injectable(),
    __param(1, Inject(FormatService)),
    __param(2, Inject(RedactService)),
    __param(3, Inject(ELK_MODULE_OPTIONS)),
    __param(4, Inject(ELK_CLIENT)),
    __metadata("design:paramtypes", [ConfigService,
        FormatService,
        RedactService, Object, Client])
], ElkService);
export { ElkService };
