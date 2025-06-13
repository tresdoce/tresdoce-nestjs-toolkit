import { FormatService } from '@tresdoce-nestjs-toolkit/utils';
import { Context, Span, SpanOptions } from '@opentelemetry/api';
import { IncomingHttpHeaders } from 'http';
export declare class TracingService {
    private readonly formatService;
    spanContext: Context;
    constructor(formatService: FormatService);
    generateDuration(_timestamp_start: any, _timestamp_end: any): string | number;
    formatDate(_timestamp: any): string;
    getTracer(): import("@opentelemetry/api").Tracer;
    startSpan(_name: string, _options?: SpanOptions): Span;
    extractSpanFromHeaders(_headers: IncomingHttpHeaders): Context | null | undefined;
    setSpanContext(_headers: IncomingHttpHeaders): void;
    getParentSpanOptions(_headers: IncomingHttpHeaders): SpanOptions | Record<string, unknown>;
    startActiveSpan(_name: string, _options?: SpanOptions): Span;
    propagateSpanContext(_headers: IncomingHttpHeaders): void;
    setSpanTags(_span: Span, _headers: any): void;
}
