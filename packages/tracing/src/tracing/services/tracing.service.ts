import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { context, Context, propagation, Span, SpanOptions, trace } from '@opentelemetry/api';
import { IncomingHttpHeaders } from 'http';

import { DEFAULT_TIME_FORMAT, DEFAULT_TIMEZONE, TAGS } from '../constants/tracing.constant';

@Injectable()
export class TracingService {
  public spanContext: Context;

  generateDuration(_timestamp_start, _timestamp_end): string {
    const start = DateTime.fromMillis(_timestamp_start);
    const end = DateTime.fromMillis(_timestamp_end);
    const duration = end.diff(start).as('seconds');
    return `${duration}s`;
  }

  formatDate(_timestamp): string {
    return DateTime.fromMillis(_timestamp).setZone(DEFAULT_TIMEZONE).toFormat(DEFAULT_TIME_FORMAT);
  }

  getTracer() {
    return trace.getTracer('default');
  }

  startSpan(_name: string, _options?: SpanOptions): Span {
    return this.getTracer().startSpan(_name, _options);
  }

  extractSpanFromHeaders(_headers: IncomingHttpHeaders): Context | null | undefined {
    return propagation.extract(context.active(), _headers);
  }
  setSpanContext(_headers: IncomingHttpHeaders): void {
    propagation.inject(context.active(), _headers);
    this.spanContext = this.extractSpanFromHeaders(_headers);
  }

  getParentSpanOptions(_headers: IncomingHttpHeaders): SpanOptions | Record<string, unknown> {
    const spanContext = this.extractSpanFromHeaders(_headers);
    /* istanbul ignore next */
    return spanContext ? { childOf: spanContext } : {};
  }

  startActiveSpan(_name: string, _options?: SpanOptions): Span {
    return this.startSpan(_name, _options);
  }

  propagateSpanContext(_headers: IncomingHttpHeaders): void {
    propagation.inject(context.active(), _headers);
  }

  setSpanTags(_span: Span, _headers: any): void {
    let tracing_tag: any;

    if (_headers && _headers[TAGS.TRACING_TAG]) {
      tracing_tag = _headers;
      Object.keys(tracing_tag).map((_key) => {
        _span.setAttribute(_key, `${tracing_tag[_key]}`);
      });
    }
  }
}
