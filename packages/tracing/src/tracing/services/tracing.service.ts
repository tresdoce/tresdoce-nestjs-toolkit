import { Injectable } from '@nestjs/common';
import {
  context,
  Context,
  propagation,
  Span,
  SpanOptions,
  trace,
} from '@opentelemetry/api';
import { IncomingHttpHeaders } from 'http';
import { TAGS } from '../constants/tracing.constant';

@Injectable()
export class TracingService {
  public spanContext: Context;

  getTracer() {
    return trace.getTracer('default');
  }

  startSpan(name: string, options?: SpanOptions): Span {
    return this.getTracer().startSpan(name, options);
  }

  extractSpanFromHeaders(headers: IncomingHttpHeaders): Context | null | undefined {
    return propagation.extract(context.active(), headers);
  }
  setSpanContext(headers: IncomingHttpHeaders): void {
    propagation.inject(context.active(), headers);
    this.spanContext = this.extractSpanFromHeaders(headers);
  }

  getParentSpanOptions(headers: IncomingHttpHeaders): SpanOptions | Record<string, unknown> {
    const spanContext = this.extractSpanFromHeaders(headers);
    /* istanbul ignore next */
    return spanContext ? { childOf: spanContext } : {};
  }

  startActiveSpan(name: string, options?: SpanOptions): Span {
    return this.startSpan(name, options);
  }

  propagateSpanContext(headers: IncomingHttpHeaders): void {
    propagation.inject(context.active(), headers);
  }

  setSpanTags(span: Span, headers: any): void {
    let tracing_tag: any;

    if (headers && headers[TAGS.TRACING_TAG]) {
      tracing_tag = headers;
      Object.keys(tracing_tag).map((key) => {
        span.setAttribute(key, `${tracing_tag[key]}`);
      });
    }
  }
}
