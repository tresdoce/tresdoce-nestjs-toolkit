import * as Tags from './tags.constants';
export const TRACING_SERVICE = 'TRACING_SERVICE';
export const defaultTraceExcludePaths = ['/liveness', '/readiness', '/manifest'];
export const FORMAT_HTTP_HEADERS = 'http_headers';
export const SPAN_ERROR = Symbol('SPAN_ERROR');
export const REQUEST_SPAN = Symbol('REQUEST_SPAN');
export const RESPONSE_SPAN = Symbol('RESPONSE_SPAN');
export const EXCEPT_TRACING_INTERCEPTOR = 'EXCEPT_TRACING_INTERCEPTOR';
export const TAGS = {
  ...Tags,
  PROTOCAL: 'protocal',
  TRACING_TAG: 'tracing-tag',
};
