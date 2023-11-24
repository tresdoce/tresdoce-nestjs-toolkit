import { Inject, Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';
import { context, Context, propagation, Span, SpanOptions, trace } from '@opentelemetry/api';
import { IncomingHttpHeaders } from 'http';

import { TAGS } from '../constants/tracing.constant';

@Injectable()
export class TracingService {
  public spanContext: Context;

  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  generateDuration(_timestamp_start, _timestamp_end): string | number {
    return this.formatService.calculateTimestampDiff({
      startTime: _timestamp_start,
      endTime: _timestamp_end,
      options: {
        addSuffix: true,
      },
    });
  }

  formatDate(_timestamp): string {
    return this.formatService.formatDate({
      date: new Date(_timestamp),
    });
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
      Object.keys(tracing_tag).forEach((_key) => {
        _span.setAttribute(_key, `${tracing_tag[_key]}`);
      });
    }
  }
}
