var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, Scope, } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { tap } from 'rxjs';
import _ from 'lodash';
import { TracingService } from '../services/tracing.service';
import { defaultExcludePaths, SKIP_TRACE, REQUEST_RECEIVED, RESPONSE_RECEIVED, } from '../constants/tracing.constant';
import * as Tags from '../constants/tags.constant';
let TracingInterceptor = class TracingInterceptor {
    constructor(tracingService, configService) {
        this.tracingService = tracingService;
        this.configService = configService;
        this.reflector = new Reflector();
    }
    intercept(_context, _next) {
        const appContext = this.configService.get('config.server.context');
        const excludePaths = _.map(defaultExcludePaths, (_item) => `/${appContext}${_item}`);
        const timeRequest = Date.now();
        const skipTrace = this.reflector.get(SKIP_TRACE, _context.getHandler());
        if (skipTrace)
            return _next.handle();
        const contextType = _context.getType();
        const controller = _context.getClass().name;
        const handler = _context.getHandler().name;
        const operation = [contextType, controller, handler].join(':');
        this.ctx = _context.switchToHttp();
        this.request = this.ctx.getRequest();
        this.response = this.ctx.getResponse();
        /* istanbul ignore next */
        if (excludePaths.includes(this.request.path))
            return _next.handle();
        /* istanbul ignore next */
        this.url = this.request.path === '/' ? `${this.request.headers.host}` : `${this.request.path}`;
        const parentSpanContext = this.tracingService.getParentSpanOptions(this.request.headers);
        this.span = this.tracingService.startActiveSpan(this.url, parentSpanContext);
        this.span.setAttributes({
            [Tags.TIMESTAMP]: timeRequest,
            [Tags.TIME_START]: this.tracingService.formatDate(timeRequest),
            [Tags.HTTP_OPERATION]: operation,
            [Tags.HTTP_CONTROLLER]: controller,
            [Tags.HTTP_HANDLER]: handler,
            [Tags.COMPONENT]: contextType,
            [Tags.SPAN_KIND]: Tags.SPAN_KIND_MESSAGING_PRODUCER,
            [Tags.HTTP_METHOD]: this.request.method,
            [Tags.HTTP_URL]: this.url,
        });
        this.span.addEvent(REQUEST_RECEIVED);
        const responseHeaders = {};
        this.tracingService.setSpanContext(responseHeaders);
        this.response.set(responseHeaders);
        Object.assign(this.request, { span: this.span });
        /* istanbul ignore next */
        if (!this.span)
            return _next.handle();
        this.tracingService.propagateSpanContext(this.request.headers);
        this.tracingService.setSpanTags(this.span, this.request.headers);
        this.tracingService.setSpanContext(this.request.headers);
        return _next.handle().pipe(tap(() => {
            this.span.setAttributes({
                [Tags.HTTP_STATUS_CODE]: this.response.statusCode,
                [Tags.TIME_END]: this.tracingService.formatDate(Date.now()),
                [Tags.TIME_DURATION]: this.tracingService.generateDuration(timeRequest, Date.now()),
            });
            this.span.addEvent(RESPONSE_RECEIVED);
            this.span.end();
        }));
    }
};
TracingInterceptor = __decorate([
    Injectable({ scope: Scope.REQUEST }),
    __metadata("design:paramtypes", [TracingService,
        ConfigService])
], TracingInterceptor);
export { TracingInterceptor };
