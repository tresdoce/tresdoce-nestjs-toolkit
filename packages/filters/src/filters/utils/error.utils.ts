import { HttpStatus } from '@nestjs/common';
import { snakeCase, toUpper } from 'lodash';
import { ExceptionResponse } from '../types';

/**
 *
 * Extract the stringifies error code
 *
 * @param exResponse - exception response
 * @returns - string that describes the error
 */
export const getCode = (exResponse: ExceptionResponse | string): string => {
  if (typeof exResponse === 'string') {
    return formatErrorCode(exResponse);
  }

  if ('error' in exResponse && typeof exResponse.error === 'string') {
    return formatErrorCode(exResponse.error);
  }

  return HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR];
};

/**
 * Format a string to uppercase and snakeCase
 *
 * @param error - string
 * @returns - ex `Bad Request` become `BAD_REQUEST`
 */
const formatErrorCode = (error: string): string => {
  return toUpper(snakeCase(error));
};
