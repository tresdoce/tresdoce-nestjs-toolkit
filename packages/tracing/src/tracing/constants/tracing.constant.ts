import { corePathsExcludesGlobs } from '@tresdoce-nestjs-toolkit/core';
import * as Tags from './tags.constant.js';

export const REQUEST_RECEIVED = 'REQUEST_RECEIVED';
export const RESPONSE_RECEIVED = 'RESPONSE_RECEIVED';
export const SKIP_TRACE = 'SKIP_TRACE';
export const TAGS = {
  ...Tags,
  TRACING_TAG: 'tracing-tag',
};

/** Headers que nunca se copian como atributos del span (pueden contener credenciales). */
export const SENSITIVE_HEADERS: string[] = [
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
];

export const DEFAULT_IGNORE_PATHS: string[] = [
  ...corePathsExcludesGlobs,
  '**/docs',
  '**/docs/*',
  '**/docs/**',
];
