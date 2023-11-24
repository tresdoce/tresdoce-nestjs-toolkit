import { excludePaths, corePathsExcludesGlobs } from '@tresdoce-nestjs-toolkit/core';
import * as Tags from './tags.constant';

export const defaultExcludePaths = excludePaths();

export const FORMAT_HTTP_HEADERS = 'http_headers';
export const SPAN_ERROR = 'SPAN_ERROR';
export const REQUEST_RECEIVED = 'REQUEST_RECEIVED';
export const RESPONSE_RECEIVED = 'RESPONSE_RECEIVED';
export const SKIP_TRACE = 'SKIP_TRACE';
export const TAGS = {
  ...Tags,
  PROTOCAL: 'protocal',
  TRACING_TAG: 'tracing-tag',
};

export const DEFAULT_IGNORE_PATHS: string[] = [
  ...corePathsExcludesGlobs,
  '**/docs',
  '**/docs/*',
  '**/docs/**',
];
