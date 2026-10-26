import { Inject, Injectable } from '@nestjs/common';
import { FormatService } from '@tresdoce-nestjs-toolkit/utils';
import {
  context,
  type Context,
  propagation,
  type Span,
  type SpanOptions,
  trace,
  type Tracer,
} from '@opentelemetry/api';
import type { IncomingHttpHeaders } from 'node:http';

import { SENSITIVE_HEADERS, TAGS } from '../constants/tracing.constant.js';

export const TRACER_NAME = '@tresdoce-nestjs-toolkit/tracing';

@Injectable()
export class TracingService {
  public spanContext: Context;

  constructor(@Inject(FormatService) private readonly formatService: FormatService) {}

  generateDuration(_timestamp_start: number, _timestamp_end: number): string | number {
    return this.formatService.calculateTimestampDiff({
      startTime: _timestamp_start,
      endTime: _timestamp_end,
      options: {
        addSuffix: true,
      },
    });
  }

  formatDate(_timestamp: number | string | Date): string {
    return this.formatService.formatDate({
      date: new Date(_timestamp),
    });
  }

  getTracer(): Tracer {
    return trace.getTracer(TRACER_NAME);
  }

  /**
   * Crea un span. Si no se indica `_context` se usa el contexto activo, por lo que
   * el span queda como hijo del span activo (p. ej. el span HTTP de la instrumentación).
   */
  startSpan(_name: string, _options?: SpanOptions, _context?: Context): Span {
    return this.getTracer().startSpan(_name, _options, _context);
  }

  /** Alias de `startSpan`. No activa el span en el contexto actual. */
  startActiveSpan(_name: string, _options?: SpanOptions, _context?: Context): Span {
    return this.startSpan(_name, _options, _context);
  }

  extractSpanFromHeaders(_headers: IncomingHttpHeaders): Context {
    return propagation.extract(context.active(), _headers);
  }

  /**
   * Devuelve el contexto padre para un nuevo span: el contexto activo si ya hay un
   * span en curso (instrumentación HTTP) o, si no, el contexto propagado en los headers
   * entrantes (`traceparent`, `b3`, `x-amzn-trace-id`, ...).
   */
  getParentContext(_headers: IncomingHttpHeaders): Context {
    const activeContext = context.active();
    return trace.getSpan(activeContext) ? activeContext : this.extractSpanFromHeaders(_headers);
  }

  /**
   * @deprecated `childOf` es un concepto de OpenTracing y OpenTelemetry lo ignora.
   * Usá `getParentContext()` y pasalo como tercer argumento de `startSpan()`.
   */
  getParentSpanOptions(_headers: IncomingHttpHeaders): SpanOptions | Record<string, unknown> {
    return { childOf: this.extractSpanFromHeaders(_headers) };
  }

  setSpanContext(_headers: IncomingHttpHeaders | Record<string, string>): void {
    propagation.inject(context.active(), _headers);
    this.spanContext = this.extractSpanFromHeaders(_headers);
  }

  propagateSpanContext(_headers: IncomingHttpHeaders | Record<string, string>): void {
    propagation.inject(context.active(), _headers);
  }

  /**
   * Si la request trae el header `tracing-tag`, copia los headers como atributos del
   * span (excepto los sensibles: `authorization`, `cookie`, `x-api-key`, ...).
   */
  setSpanTags(_span: Span, _headers: IncomingHttpHeaders): void {
    if (!_headers?.[TAGS.TRACING_TAG]) return;

    Object.entries(_headers)
      .filter(([_key]) => !SENSITIVE_HEADERS.includes(_key.toLowerCase()))
      .forEach(([_key, _value]) =>
        _span.setAttribute(_key, Array.isArray(_value) ? _value.join(', ') : String(_value)),
      );
  }
}
