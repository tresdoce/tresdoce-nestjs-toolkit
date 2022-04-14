import { Injectable } from '@nestjs/common';
import {
  trace,
  context,
  propagation,
  Span,
  SpanContext,
  Context,
  SpanOptions,
} from '@opentelemetry/api';
import { IncomingHttpHeaders } from 'http';
import { TAGS } from '../constants/tracing.constants';

@Injectable()
export class TracingService {
  public spanContext: Context;

  getTracer() {
    return trace.getTracer('default');
  }

  getSpan(): Span {
    return trace.getSpan(context.active());
  }

  getSpanContext(): SpanContext {
    return trace.getSpanContext(context.active());
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
    return spanContext ? { childOf: spanContext } : {};
  }

  startActiveSpan(name: string, options?: SpanOptions): Span {
    const span = this.startSpan(name, options);
    return span;
  }

  propagateSpanContext(headers: IncomingHttpHeaders): void {
    propagation.inject(context.active(), headers);
  }

  setSpanTags(span: Span, headers: IncomingHttpHeaders): void {
    let tracing_tag: any;
    if (headers && headers[TAGS.TRACING_TAG]) {
      tracing_tag = JSON.parse(<string>headers[TAGS.TRACING_TAG]);
    }
    for (const key in tracing_tag) {
      span.setAttribute(key, tracing_tag[key]);
    }
  }
}
