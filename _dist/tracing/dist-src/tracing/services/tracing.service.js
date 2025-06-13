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
import { Inject, Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';
import { context, propagation, trace } from '@opentelemetry/api';
import { TAGS } from '../constants/tracing.constant';
let TracingService = class TracingService {
    constructor(formatService) {
        this.formatService = formatService;
    }
    generateDuration(_timestamp_start, _timestamp_end) {
        return this.formatService.calculateTimestampDiff({
            startTime: _timestamp_start,
            endTime: _timestamp_end,
            options: {
                addSuffix: true,
            },
        });
    }
    formatDate(_timestamp) {
        return this.formatService.formatDate({
            date: new Date(_timestamp),
        });
    }
    getTracer() {
        return trace.getTracer('default');
    }
    startSpan(_name, _options) {
        return this.getTracer().startSpan(_name, _options);
    }
    extractSpanFromHeaders(_headers) {
        return propagation.extract(context.active(), _headers);
    }
    setSpanContext(_headers) {
        propagation.inject(context.active(), _headers);
        this.spanContext = this.extractSpanFromHeaders(_headers);
    }
    getParentSpanOptions(_headers) {
        const spanContext = this.extractSpanFromHeaders(_headers);
        /* istanbul ignore next */
        return spanContext ? { childOf: spanContext } : {};
    }
    startActiveSpan(_name, _options) {
        return this.startSpan(_name, _options);
    }
    propagateSpanContext(_headers) {
        propagation.inject(context.active(), _headers);
    }
    setSpanTags(_span, _headers) {
        let tracing_tag;
        if (_headers && _headers[TAGS.TRACING_TAG]) {
            tracing_tag = _headers;
            Object.keys(tracing_tag).forEach((_key) => {
                _span.setAttribute(_key, `${tracing_tag[_key]}`);
            });
        }
    }
};
TracingService = __decorate([
    Injectable(),
    __param(0, Inject(FormatService)),
    __metadata("design:paramtypes", [FormatService])
], TracingService);
export { TracingService };
