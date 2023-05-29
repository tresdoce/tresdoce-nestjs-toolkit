import { excludePaths } from '@tresdoce-nestjs-toolkit/core';
import * as Tags from './tags.constant';

export const TRACING_MODULE_OPTIONS = Symbol('TRACING_MODULE_OPTIONS');
export const TRACING_PROVIDER = Symbol('TRACING_PROVIDER');
export const TRACING_SERVICE = 'TRACING_SERVICE';

export const defaultExcludePaths = excludePaths();

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
