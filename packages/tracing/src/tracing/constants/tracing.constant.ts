import { excludePaths } from '@tresdoce-nestjs-toolkit/core';
import * as Tags from './tags.constant';

export const defaultExcludePaths = excludePaths();
export const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';
/*
'dd/LL/yyyy TT.SSS'; // 05/06/2023 16:54:30.752
'dd/LL/yyyy hh:mm:ss.SSS a'; // 05/06/2023 04:49:44.033 PM
*/
export const DEFAULT_TIME_FORMAT = 'dd/LL/yyyy TT.SSS'; // 05/06/2023 16:54:30.752

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
